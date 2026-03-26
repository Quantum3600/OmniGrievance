import pytest
from fastapi.testclient import TestClient
from unittest.mock import patch, MagicMock, AsyncMock
import os

from app.main import app
from app.api.ingestion import router
from app.services.communications import process_whatsapp_message
from app.database import get_db

client = TestClient(app)

# Mock DB for dependency injection
mock_db_session = AsyncMock()

async def override_get_db():
    yield mock_db_session

app.dependency_overrides[get_db] = override_get_db

def test_whatsapp_webhook_verification():
    os.environ["WHATSAPP_VERIFY_TOKEN"] = "test_secret"
    
    # Valid verification
    response = client.get(
        "/api/v1/ingest/whatsapp/webhook",
        params={
            "hub.mode": "subscribe",
            "hub.verify_token": "test_secret",
            "hub.challenge": "12345"
        }
    )
    assert response.status_code == 200
    assert response.text == "12345"

@pytest.mark.asyncio
async def test_receive_whatsapp_webhook_triggers_task():
    payload = {"entry": [{"changes": [{"value": {"messages": [{"from": "919876543210", "type": "text", "text": {"body": "test"}}]}}]}]}
    
    with patch("app.api.ingestion.BackgroundTasks.add_task") as mock_add_task:
        response = client.post("/api/v1/ingest/whatsapp/webhook", json=payload)
        assert response.status_code == 200
        assert mock_add_task.called

@pytest.mark.asyncio
@patch("app.services.communications.download_whatsapp_media")
@patch("app.services.ai_gateway.process_audio")
@patch("app.services.ai_gateway.classify_intent")
async def test_process_whatsapp_message_logic(mock_classify, mock_process_audio, mock_download):
    mock_classify.return_value = {"category": "CIVIC_AMENITIES", "priority": "Medium"}
    mock_process_audio.return_value = "transcribed text"
    # mock_download not used in this path as we'll test text first
    
    payload = {
        "entry": [{
            "changes": [{
                "value": {
                    "messages": [{
                        "from": "919876543210",
                        "type": "text",
                        "text": {"body": "pothole on road"}
                    }]
                }
            }]
        }]
    }
    
    # Mock DB interactions
    mock_session = AsyncMock()
    mock_user = MagicMock()
    mock_user.id = 1
    mock_user.phone = "919876543210"
    
    mock_result = MagicMock()
    mock_scalars = MagicMock()
    mock_scalars.first.return_value = mock_user
    mock_result.scalars.return_value = mock_scalars
    mock_session.execute.return_value = mock_result
    
    await process_whatsapp_message(payload, mock_session)
    
    assert mock_session.add.called
    assert mock_session.commit.called
