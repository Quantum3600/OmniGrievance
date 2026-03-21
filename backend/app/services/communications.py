import os
import httpx
import logging
import asyncio
from typing import Optional

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
            response.raise_for_status()
            return True
    except Exception as e:
        logger.error(f"WhatsApp API Error: {e}")
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
