import os
import logging
from fastapi import APIRouter, Request, HTTPException, BackgroundTasks
from fastapi.responses import PlainTextResponse

from app.api.intake import omnichannel_intake

logger = logging.getLogger("OmniGrievance.Webhook")
router = APIRouter(prefix="/webhooks/whatsapp", tags=["whatsapp-webhook"])

@router.get("/")
async def verify_webhook(request: Request):
    """
    Verifies the webhook configuration from Meta/WhatsApp Business API.
    """
    verify_token = os.getenv("WHATSAPP_VERIFY_TOKEN")
    mode = request.query_params.get("hub.mode")
    token = request.query_params.get("hub.verify_token")
    challenge = request.query_params.get("hub.challenge")

    if mode and token:
        if mode == "subscribe" and token == verify_token:
            logger.info("WhatsApp Webhook Verified.")
            return PlainTextResponse(content=challenge, status_code=200)
        else:
            raise HTTPException(status_code=403, detail="Verification token mismatch")
    
    raise HTTPException(status_code=400, detail="Missing parameters")

@router.post("/")
async def receive_whatsapp_message(request: Request, background_tasks: BackgroundTasks):
    """
    Receives inbound messages from citizens via WhatsApp Meta Graph API.
    Passes them to the standard Omnichannel Intake logic.
    """
    try:
        data = await request.json()
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid JSON")

    # Meta webhook structure parsing
    if data.get("object") == "whatsapp_business_account":
        for entry in data.get("entry", []):
            for change in entry.get("changes", []):
                value = change.get("value", {})
                messages = value.get("messages", [])
                
                for msg in messages:
                    sender = msg.get("from")
                    msg_type = msg.get("type", "text")
                    body_text = msg.get("text", {}).get("body", "") if msg_type == "text" else ""
                    
                    if not sender:
                        continue
                        
                    # Construct internal payload
                    payload = {
                        "wa_id": sender,
                        "body_text": body_text,
                        "latitude": None,
                        "longitude": None,
                        "media_id": None
                    }
                    
                    # Background task to not block Meta's 200 OK requirement
                    background_tasks.add_task(
                        omnichannel_intake,
                        channel_type="whatsapp",
                        payload=payload,
                        background_tasks=background_tasks
                    )
                    
        return {"status": "success"}

    raise HTTPException(status_code=404, detail="Not a WhatsApp event")
