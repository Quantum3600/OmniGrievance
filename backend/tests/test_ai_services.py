import pytest
import os
from unittest.mock import patch, MagicMock
from app.services import audio_processing, vision_processing, nlp_processing
import httpx

@pytest.fixture
def mock_env(monkeypatch):
    monkeypatch.setenv("WHISPER_API_KEY", "test_whisper_key")
    monkeypatch.setenv("HUGGING_FACE_API_KEY", "test_hf_key")

@pytest.mark.asyncio
async def test_transcribe_audio_success(mock_env):
    """Test successful Whisper transcription mocking the httpx client."""
    mock_response = MagicMock()
    mock_response.status_code = 200
    mock_response.json.return_value = {"text": "This is a tested transcription."}
    
    with patch("httpx.AsyncClient.post", return_value=mock_response):
        result = await audio_processing.transcribe_audio(b"dummy_audio_bytes")
        assert result == "This is a tested transcription."

@pytest.mark.asyncio
async def test_transcribe_audio_fallback(mock_env):
    """Test Whisper transcription circuit breaking on exception."""
    with patch("httpx.AsyncClient.post", side_effect=httpx.TimeoutException("Timeout")):
        result = await audio_processing.transcribe_audio(b"dummy")
        assert "Transcription failed" in result

@pytest.mark.asyncio
async def test_classify_intent_emergency(mock_env):
    """Test NLP intent parsing correctly overriding on emergency keywords."""
    text = "There is a massive gas leak near the hospital!"
    
    mock_response = MagicMock()
    mock_response.status_code = 200
    mock_response.json.return_value = {"labels": ["Public Safety", "General Handling"]}
    
    with patch("httpx.AsyncClient.post", return_value=mock_response):
        result = await nlp_processing.classify_intent(text)
        
        assert result["is_emergency"] is True
        assert result["priority"] == "Critical"
        assert result["category"] == "Public Safety"

@pytest.mark.asyncio
async def test_analyze_image_fallback_loading(mock_env):
    """Test visual anomaly returning fallback gracefully if Hugging Face is still loading (503)."""
    mock_response = MagicMock()
    mock_response.status_code = 503
    
    with patch("httpx.AsyncClient.post", return_value=mock_response):
        result = await vision_processing.analyze_image(b"dummy_image_bytes", "test.jpg")
        
        # When 503 loading, should return empty/default state
        assert result["context"] == ""
        assert len(result["labels"]) == 0
        assert result["confidence_score"] == 0.0
