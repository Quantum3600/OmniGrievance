import os
import httpx
import logging
import asyncio
import datetime
import json
import redis.asyncio as redis
from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.models import User, RoleEnum, Grievance, GrievanceStatusEnum, GrievanceCategoryEnum
from app.services import ai_gateway

# Initialize Redis client for tracking conversation state
redis_client = redis.from_url(os.getenv("REDIS_URL", "redis://redis:6379"), decode_responses=True)

logger = logging.getLogger("OmniGrievance.Communications")

async def send_whatsapp_message(phone_number: str, message: str) -> bool:
    if os.getenv("USE_MOCK_APIS", "").lower() == "true":
        await asyncio.sleep(0.4)
        logger.info(f"[OUTBOUND -> {phone_number}] [Via: WhatsApp (MOCK)] {message}")
        return True

    whatsapp_url = os.getenv("WHATSAPP_API_URL")
    whatsapp_token = os.getenv("WHATSAPP_TOKEN")
    
    if not whatsapp_url or not whatsapp_token:
        logger.warning("WhatsApp API not configured. Falling back to mock.")
        logger.info(f"[OUTBOUND -> {phone_number}] [Via: WhatsApp] {message}")
        return True
        
    try:
        async with httpx.AsyncClient() as client:
            headers = {
                "Authorization": f"Bearer {whatsapp_token}",
                "Content-Type": "application/json"
            }
            payload = {
                "messaging_product": "whatsapp",
                "to": phone_number,
                "type": "text",
                "text": {"body": message}
            }
            response = await client.post(whatsapp_url, json=payload, headers=headers, timeout=10.0)
            if response.status_code != 200:
                logger.error(f"WhatsApp API Error ({response.status_code}): {response.text}")
            response.raise_for_status()
            return True
    except httpx.HTTPStatusError as e:
        logger.error(f"WhatsApp HTTP Error: {e.response.status_code} - {e.response.text}")
        return False
    except Exception as e:
        logger.error(f"WhatsApp unexpected Error: {e}")
        return False

async def send_sms_notification(phone_number: str, message: str) -> bool:
    if os.getenv("USE_MOCK_APIS", "").lower() == "true":
        await asyncio.sleep(0.2)
        logger.info(f"[OUTBOUND -> {phone_number}] [Via: SMS (MOCK)] {message}")
        return True

    sms_url = os.getenv("SMS_GATEWAY_URL")
    sms_key = os.getenv("SMS_API_KEY")
    
    if not sms_url:
        logger.warning("SMS Gateway not configured. Falling back to mock.")
        logger.info(f"[OUTBOUND -> {phone_number}] [Via: SMS] {message}")
        return True
        
    try:
        async with httpx.AsyncClient() as client:
            headers = {"Authorization": f"Bearer {sms_key}"} if sms_key else {}
            payload = {
                "to": phone_number,
                "message": message
            }
            response = await client.post(sms_url, json=payload, headers=headers, timeout=10.0)
            response.raise_for_status()
            return True
    except Exception as e:
        logger.error(f"SMS Gateway Error: {e}")
        return False

async def notify_citizen(phone_number: str, title: str, status: str, language: str = "en") -> bool:
    """
    Sends WhatsApp and/or SMS state updates, eliminating the Citizen's need 
    to manually refresh a webpage to check resolution status.
    """
    message = f"Subject: {title}\nUpdate: The status of your grievance is now '{status}'. Thank you for your patience."
    
    # Try WhatsApp first, fallback to SMS
    success = await send_whatsapp_message(phone_number, message)
    if not success:
        logger.info(f"WhatsApp failed or unavailable for {phone_number}, attempting SMS.")
        success = await send_sms_notification(phone_number, message)
        
    return success

async def download_whatsapp_media(media_id: str) -> bytes:
    """
    Downloads media (image/audio) from Meta's servers using the Media ID.
    """
    whatsapp_token = os.getenv("WHATSAPP_TOKEN")
    # Note: Meta's media download usually requires 2 steps: 
    # 1. Get URL from media ID 
    # 2. Download from that URL
    # For MVP we'll implement the basic logic.
    media_url_info = f"https://graph.facebook.com/v17.0/{media_id}"
    
    try:
        async with httpx.AsyncClient() as client:
            headers = {"Authorization": f"Bearer {whatsapp_token}"}
            # Step 1: Get media URL
            response = await client.get(media_url_info, headers=headers)
            if response.status_code != 200:
                logger.error(f"WhatsApp Media Meta-Data Error ({response.status_code}): {response.text}")
            response.raise_for_status()
            download_url = response.json().get("url")
            
            # Step 2: Download media
            media_resp = await client.get(download_url, headers=headers)
            if media_resp.status_code != 200:
                logger.error(f"WhatsApp Media Download Error ({media_resp.status_code}): {media_resp.text}")
            media_resp.raise_for_status()
            return media_resp.content
    except httpx.HTTPStatusError as e:
        logger.error(f"WhatsApp Media HTTP Error: {e.response.status_code} - {e.response.text}")
        raise
    except Exception as e:
        logger.error(f"WhatsApp Media unexpected error: {e}")
        raise

async def process_whatsapp_message(payload: dict, db: AsyncSession):
    """
    Stateful background job to handle WhatsApp bot flow:
    Welcome -> Ask for Description (Text/Audio) -> Ask for Image -> Confirmation/Register.
    """
    try:
        # 1. Extract Message Info
        entry = payload.get("entry", [{}])[0]
        change = entry.get("changes", [{}])[0]
        value = change.get("value", {})
        message = value.get("messages", [{}])[0]
        
        if not message:
            return

        phone_number = message.get("from")
        msg_type = message.get("type")
        message_id = message.get("id")
        
        # 2. Identify/Create User
        result = await db.execute(select(User).where(User.phone == phone_number))
        user = result.scalars().first()
        if not user:
            user = User(
                phone=phone_number,
                name=f"WhatsApp Citizen {phone_number[-4:]}",
                role=RoleEnum.CITIZEN
            )
            db.add(user)
            await db.commit()
            await db.refresh(user)

        # 3. Session Management via Redis
        session_key = f"wa_session:{phone_number}"
        raw_session = await redis_client.get(session_key)
        session = json.loads(raw_session) if raw_session else {"state": "START"}
        
        # Handle "restart" command
        text_body = ""
        if msg_type == "text":
            text_body = message.get("text", {}).get("body", "").strip().lower()
            if text_body in ["restart", "reset", "menu", "start"]:
                session = {"state": "START"}

        # 4. State Machine
        if session["state"] == "START":
            welcome_msg = (
                "👋 Welcome to *OmniGrievance*!\n\n"
                "I am your AI assistant for reporting civic issues directly to the administration.\n\n"
                "To begin, please *describe the issue* you are facing. You can type it here or record a voice note. 🎤"
            )
            await send_whatsapp_message(phone_number, welcome_msg)
            session["state"] = "AWAITING_DESCRIPTION"
            await redis_client.set(session_key, json.dumps(session), ex=3600)
            return

        if session["state"] == "AWAITING_DESCRIPTION":
            description = ""
            audio_url = None
            
            if msg_type == "text":
                description = message.get("text", {}).get("body", "")
            elif msg_type == "audio":
                audio_id = message.get("audio", {}).get("id")
                audio_bytes = await download_whatsapp_media(audio_id)
                
                os.makedirs("uploads/audio", exist_ok=True)
                filename = f"wa_{datetime.datetime.now().timestamp()}.ogg"
                filepath = os.path.join("uploads/audio", filename)
                with open(filepath, "wb") as f:
                    f.write(audio_bytes)
                audio_url = f"/uploads/audio/{filename}"
                
                # AI Transcription
                transcription = await ai_gateway.process_audio(audio_bytes)
                description = transcription or "Voice message description"
            else:
                await send_whatsapp_message(phone_number, "Please send a text description or a voice note to continue. 📝")
                return

            session["description"] = description
            session["audio_url"] = audio_url
            session["state"] = "AWAITING_IMAGE"
            
            await send_whatsapp_message(phone_number, "Thank you! I've noted the description. ✅\n\nNow, please *upload a photo* of the issue. This helps our team verify and prioritize the work. 📸")
            await redis_client.set(session_key, json.dumps(session), ex=3600)
            return

        if session["state"] == "AWAITING_IMAGE":
            if msg_type == "image":
                image_id = message.get("image", {}).get("id")
                caption = message.get("image", {}).get("caption", "")
                image_bytes = await download_whatsapp_media(image_id)
                
                os.makedirs("uploads/images", exist_ok=True)
                filename = f"wa_{datetime.datetime.now().timestamp()}.jpg"
                filepath = os.path.join("uploads/images", filename)
                with open(filepath, "wb") as f:
                    f.write(image_bytes)
                image_url = f"/uploads/images/{filename}"
                
                # Combine context
                base_desc = session.get("description", "")
                vision_result = await ai_gateway.analyze_image(image_bytes)
                vision_context = ", ".join(vision_result.get("labels", []))
                final_description = f"{base_desc}. {caption} [Visual Context: {vision_context}]".strip()
                
                # Orchestrate Final Classification
                nlp_result = await ai_gateway.classify_intent(final_description)
                category = nlp_result["category"]
                is_emergency = nlp_result.get("priority") == "High" or any(kw in final_description.lower() for kw in ["live wire", "gas leak", "structural collapse", "fire"])

                # Create Persistent Grievance Record
                new_grievance = Grievance(
                    citizen_id=user.id,
                    description=final_description,
                    category=category,
                    is_emergency=is_emergency,
                    image_url=image_url,
                    audio_url=session.get("audio_url"),
                    status=GrievanceStatusEnum.POSTED
                )
                db.add(new_grievance)
                await db.commit()
                await db.refresh(new_grievance)
                
                # Send Confirmation
                conf_msg = (
                    f"✅ *Grievance Registered Successfully!*\n\n"
                    f"*ID:* #OG-{new_grievance.id}\n"
                    f"*Category:* {category}\n"
                    f"*Priority:* {'🚨 Emergency' if is_emergency else 'Standard'}\n\n"
                    f"Our team has been notified. You will receive updates as we progress. Thank you for being a responsible citizen! 🇮🇳"
                )
                await send_whatsapp_message(phone_number, conf_msg)
                
                # Clear session
                await redis_client.delete(session_key)
                logger.info(f"[WHATSAPP BOT] Completed grievance {new_grievance.id} for {phone_number}")
            else:
                await send_whatsapp_message(phone_number, "Please upload a photo of the incident to finalize your report. 📷")
            return

    except Exception as e:
        logger.error(f"Error in WhatsApp bot flow: {e}", exc_info=True)
        await db.rollback()
