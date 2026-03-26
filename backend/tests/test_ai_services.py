import pytest
import httpx
from unittest.mock import patch, MagicMock
from fastapi import HTTPException, UploadFile
import io

from app.services.audio_processing import transcribe_audio
from app.services.vision_processing import analyze_image
from app.services.nlp_processing import categorize_grievance, check_emergency_override

@pytest.mark.asyncio
@patch("httpx.AsyncClient.post")
async def test_transcribe_audio_timeout(mock_post, monkeypatch):
    monkeypatch.setenv("WHISPER_API_KEY", "test_key")
    
    # Simulate a timeout circuit breaker error
    mock_post.side_effect = httpx.HTTPError("Request timed out")
    
    # Create fake upload file
    file = UploadFile(filename="test.m4a", file=io.BytesIO(b"test"))
    
    with pytest.raises(HTTPException) as exc_info:
        await transcribe_audio(file)
        
    assert exc_info.value.status_code == 500
    assert "Whisper API error" in exc_info.value.detail

@pytest.mark.asyncio
@patch("httpx.AsyncClient.post")
async def test_categorize_grievance_emergency(mock_post, monkeypatch):
    monkeypatch.setenv("HUGGING_FACE_API_KEY", "test_key")
    
    mock_response = MagicMock()
    mock_response.json.return_value = {
        "labels": ["PUBLIC_HEALTH", "LAW_AND_ORDER"],
        "scores": [0.99, 0.01]
    }
    mock_post.return_value = mock_response

    text = "There is a massive gas leak near the hospital!"
    result = await categorize_grievance(text)
    
    assert result["is_emergency"] is True
    assert result["category"].value == "PUBLIC_HEALTH"

@pytest.mark.asyncio
@patch("httpx.AsyncClient.post")
async def test_analyze_image_success(mock_post, monkeypatch):
    monkeypatch.setenv("HUGGING_FACE_API_KEY", "test_key")
    
    mock_response = MagicMock()
    mock_response.json.return_value = [{"generated_text": "huge fire in the residential building"}]
    mock_post.return_value = mock_response

    file = UploadFile(filename="test.jpg", file=io.BytesIO(b"test"))
    result = await analyze_image(file)
    
    assert result["severity"] == "HIGH"
    assert "fire" in result["context"]

def test_emergency_override_logic():
    assert check_emergency_override("Everything is fine here") is False
    assert check_emergency_override("Help, there is a live wire on the street") is True
