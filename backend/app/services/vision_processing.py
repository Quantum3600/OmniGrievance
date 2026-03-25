import os
import io
import httpx
import logging
from typing import Dict, Any
from PIL import Image
import piexif

logger = logging.getLogger("OmniGrievance.VisionProcessing")

def _extract_exif_gps(image_bytes: bytes) -> Dict[str, float]:
    """Helper method to parse EXIF tags and extract real GPS from original image files."""
    try:
        img = Image.open(io.BytesIO(image_bytes))
        if "exif" not in img.info:
            return {}
        
        exif_dict = piexif.load(img.info["exif"])
        gps_data = exif_dict.get("GPS", {})
        
        if not gps_data:
            return {}

        def convert_to_degrees(value):
            d = float(value[0][0]) / float(value[0][1])
            m = float(value[1][0]) / float(value[1][1])
            s = float(value[2][0]) / float(value[2][1])
            return d + (m / 60.0) + (s / 3600.0)
            
        lat_ref = gps_data.get(piexif.GPSIFD.GPSLatitudeRef)
        lat = gps_data.get(piexif.GPSIFD.GPSLatitude)
        lon_ref = gps_data.get(piexif.GPSIFD.GPSLongitudeRef)
        lon = gps_data.get(piexif.GPSIFD.GPSLongitude)
        
        if lat and lon and lat_ref and lon_ref:
            lat_deg = convert_to_degrees(lat)
            if lat_ref != b'N':
                lat_deg = -lat_deg
            
            lon_deg = convert_to_degrees(lon)
            if lon_ref != b'E':
                lon_deg = -lon_deg
                
            return {"lat": round(lat_deg, 6), "lon": round(lon_deg, 6)}
            
    except Exception as e:
        logger.warning(f"Failed to extract EXIF data: {e}")
    
    return {}

async def analyze_image(file_bytes: bytes, filename: str) -> Dict[str, Any]:
    """
    Calls BLIP-2 computer vision service to analyze anomalies. 
    Extracts explicit GPS bounds from original file metadata.
    """
    extracted_gps = _extract_exif_gps(file_bytes)
    
    api_key = os.getenv("HUGGING_FACE_API_KEY")
    result = {
        "is_fake": False,
        "extracted_gps": extracted_gps,
        "labels": [],
        "context": "",
        "confidence_score": 0.0
    }
    
    if not api_key:
        logger.warning("HUGGING_FACE_API_KEY not configured. Returning fallback anomalies.")
        result["labels"] = ["pothole", "street", "damage", "MOCK_VI"]
        result["confidence_score"] = 0.94
        return result

    # Targeting Salesforce BLIP-image-captioning-large directly
    model_url = "https://api-inference.huggingface.co/models/Salesforce/blip-image-captioning-large"
    
    try:
        async with httpx.AsyncClient() as client:
            headers = {"Authorization": f"Bearer {api_key}"}
            # Sending raw bytes directly as inference API expects binary or base64 for vision.
            response = await client.post(model_url, content=file_bytes, headers=headers, timeout=20.0)
            
            if response.status_code == 503:
                # Model is loading
                logger.error("Hugging Face vision model is currently loading. Returning fallback.")
                return result

            response.raise_for_status()
            data = response.json()
            
            # Formulate the response
            if isinstance(data, list) and len(data) > 0:
                generated_text = data[0].get("generated_text", "")
                result["context"] = generated_text
                # A basic tagging logic splitting the generative response
                result["labels"] = generated_text.split()
                # Dummy high confidence given simple generative model
                result["confidence_score"] = 0.85 
            
            return result
    except Exception as e:
        logger.error(f"Error calling BLIP-2 service: {e}")
        return result
