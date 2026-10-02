import io
import json
import mimetypes
from typing import Any, Dict, List, Optional
import boto3
from botocore.config import Config
from botocore.exceptions import ClientError
from app.config import (
    R2_ACCOUNT_ID,
    R2_ACCESS_KEY_ID,
    R2_SECRET_ACCESS_KEY,
    R2_BUCKET_NAME,
    R2_ENDPOINT_URL,
    R2_PUBLIC_URL,
)


def get_s3_client():
    """Initializes and returns a boto3 S3 client configured for Cloudflare R2."""
    if not (R2_ACCESS_KEY_ID and R2_SECRET_ACCESS_KEY and R2_ENDPOINT_URL):
        return None

    return boto3.client(
        service_name="s3",
        endpoint_url=R2_ENDPOINT_URL,
        aws_access_key_id=R2_ACCESS_KEY_ID,
        aws_secret_access_key=R2_SECRET_ACCESS_KEY,
        region_name="auto",
        config=Config(
            s3={"addressing_style": "path"},
            signature_version="s3v4",
            retries={"max_attempts": 3, "mode": "standard"},
        ),
    )


def get_public_url(key: str) -> str:
    """Returns the direct public CDN URL for an R2 object key."""
    clean_key = key.lstrip("/")
    if R2_PUBLIC_URL:
        return f"{R2_PUBLIC_URL}/{clean_key}"
    return f"{R2_ENDPOINT_URL}/{R2_BUCKET_NAME}/{clean_key}"


def upload_bytes(file_bytes: bytes, key: str, content_type: Optional[str] = None) -> Dict[str, Any]:
    """Uploads in-memory bytes directly to R2."""
    s3 = get_s3_client()
    if not s3:
        raise ValueError("R2 client not configured. Check your credentials in .env")

    if not content_type:
        content_type, _ = mimetypes.guess_type(key)
        if not content_type:
            content_type = "application/octet-stream"

    clean_key = key.lstrip("/")

    extra_args = {
        "ContentType": content_type,
        "CacheControl": "public, max-age=31536000, immutable",
    }

    s3.upload_fileobj(
        io.BytesIO(file_bytes),
        R2_BUCKET_NAME,
        clean_key,
        ExtraArgs=extra_args,
    )

    return {
        "key": clean_key,
        "url": get_public_url(clean_key),
        "size": len(file_bytes),
        "contentType": content_type,
    }


def list_project_assets(project_id: str) -> List[Dict[str, Any]]:
    """Lists all asset objects stored under a project's folder in R2."""
    s3 = get_s3_client()
    if not s3:
        return []

    prefix = f"assets/projects/assets/{project_id}/"
    files = []

    try:
        paginator = s3.get_paginator("list_objects_v2")
        for page in paginator.paginate(Bucket=R2_BUCKET_NAME, Prefix=prefix):
            for item in page.get("Contents", []):
                key = item["Key"]
                filename = key.split("/")[-1]
                if not filename:
                    continue

                ext = filename.lower().split(".")[-1]
                is_img = ext in ["png", "jpg", "jpeg", "webp", "svg", "gif", "avif"]
                is_vid = ext in ["mp4", "webm", "mov"]
                size_bytes = item.get("Size", 0)

                files.append({
                    "name": filename,
                    "key": key,
                    "relPath": key,
                    "url": get_public_url(key),
                    "isImage": is_img,
                    "isVideo": is_vid,
                    "size": size_bytes,
                    "sizeFormatted": (
                        f"{size_bytes / 1024:.1f} KB"
                        if size_bytes < 1024 * 1024
                        else f"{size_bytes / (1024 * 1024):.2f} MB"
                    ),
                    "lastModified": item.get("LastModified", "").isoformat()
                    if hasattr(item.get("LastModified"), "isoformat")
                    else "",
                })
    except ClientError as e:
        print(f"Error listing R2 objects: {e}")

    return files


def save_projects_json(data: Dict[str, Any]) -> str:
    """Persists projects configuration dictionary as projects.json directly in R2."""
    s3 = get_s3_client()
    if not s3:
        raise ValueError("R2 client not configured.")

    json_bytes = json.dumps(data, indent=2, ensure_ascii=False).encode("utf-8")
    upload_bytes(json_bytes, "data/projects.json", content_type="application/json")
    return get_public_url("data/projects.json")


def load_projects_json() -> Optional[Dict[str, Any]]:
    """Attempts to read projects.json directly from R2."""
    s3 = get_s3_client()
    if not s3:
        return None

    try:
        response = s3.get_object(Bucket=R2_BUCKET_NAME, Key="data/projects.json")
        body = response["Body"].read().decode("utf-8")
        return json.loads(body)
    except Exception:
        return None
