import cloudinary
import cloudinary.uploader
import logging
from config import settings

logger = logging.getLogger(__name__)

# Configure Cloudinary if credentials are provided
if settings.CLOUDINARY_CLOUD_NAME and settings.CLOUDINARY_API_KEY and settings.CLOUDINARY_API_SECRET:
    cloudinary.config(
        cloud_name=settings.CLOUDINARY_CLOUD_NAME,
        api_key=settings.CLOUDINARY_API_KEY,
        api_secret=settings.CLOUDINARY_API_SECRET,
        secure=True
    )
    logger.info("Cloudinary configured successfully.")
else:
    logger.warning("Cloudinary credentials missing. File uploads will fallback to placeholder URLs.")

def upload_to_cloudinary(file_source, folder="shree_interiors") -> str:
    """
    Uploads a file (base64 string, URL, file-like object, or file path) to Cloudinary.
    Returns the secure URL of the uploaded asset, or a fallback URL if credentials are not set.
    """
    # Check if credentials are set
    if not (settings.CLOUDINARY_CLOUD_NAME and settings.CLOUDINARY_API_KEY and settings.CLOUDINARY_API_SECRET):
        # Fallback placeholder
        logger.warning("Cloudinary credentials not configured. Returning dummy URL.")
        # If it's base64 or a local data URI, return a sample image URL
        if isinstance(file_source, str) and file_source.startswith("data:"):
            # We can return the same data URI for mock demonstration
            return file_source
        return "https://res.cloudinary.com/demo/image/upload/v1580977265/sample.jpg"

    try:
        # Determine resource type (e.g. 'raw' for PDFs, 'image' for PNG/JPG/SVG)
        resource_type = "auto"
        
        # If the file source is a base64 string, make sure it is uploaded as auto/image
        # If it contains pdf signature, resource_type can be raw
        if isinstance(file_source, str):
            if "application/pdf" in file_source or file_source.startswith("JVBER"):
                resource_type = "raw"
                
        response = cloudinary.uploader.upload(
            file_source,
            folder=folder,
            resource_type=resource_type
        )
        return response.get("secure_url")
    except Exception as e:
        logger.error(f"Cloudinary upload failed: {str(e)}")
        # Fallback to direct return or sample if it fails
        if isinstance(file_source, str) and file_source.startswith("data:"):
            return file_source
        return "https://res.cloudinary.com/demo/image/upload/v1580977265/sample.jpg"
