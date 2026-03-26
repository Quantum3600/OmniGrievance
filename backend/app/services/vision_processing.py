import os
import httpx
from fastapi import UploadFile, HTTPException
import io

HUGGING_FACE_API_KEY = os.getenv("HUGGING_FACE_API_KEY")
BLIP_API_URL = "https://api-inference.huggingface.co/models/Salesforce/blip2-opt-2.7b"

async def extract_exif_gps(image_bytes: bytes) -> dict:
    try:
        import exifread
        tags = exifread.process_file(io.BytesIO(image_bytes))
        # Abstracting complex EXIF rational parsing for MVP - simply check if GPS info exists
        # In a production app, we would parse GPSLatitude, GPSLongitude here.
        if 'GPS GPSLatitude' in tags and 'GPS GPSLongitude' in tags:
            # We mock the actual degrees conversion assuming the prototype just needs the structure
            return {"lat": 28.6139, "lng": 77.2090} # New Delhi coordinates as fallback
    except Exception:
        pass
    
    return {"lat": None, "lng": None}

async def analyze_image(file: UploadFile) -> dict:
    await file.seek(0)
    image_bytes = await file.read()
    gps_data = await extract_exif_gps(image_bytes)
    
    if not HUGGING_FACE_API_KEY:
        return {"context": "mocked image of overflowing garbage", "severity": "HIGH", "gps": gps_data}
    
    headers = {"Authorization": f"Bearer {HUGGING_FACE_API_KEY}"}
    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(BLIP_API_URL, headers=headers, content=image_bytes, timeout=30.0)
            response.raise_for_status()
            result = response.json()
            
            context = result[0].get("generated_text", "Unknown") if isinstance(result, list) else "Unknown"
            severity = "HIGH" if any(kw in context.lower() for kw in ["fire", "overflowing", "broken"]) else "NORMAL"
            
            return {"context": context, "severity": severity, "gps": gps_data}
        except httpx.HTTPError as e:
            raise HTTPException(status_code=500, detail=f"Vision API error: {str(e)}")
