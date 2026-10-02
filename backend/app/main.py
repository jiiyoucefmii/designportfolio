import os
import re
import json
from pathlib import Path
from typing import Any, Dict, Optional
from fastapi import FastAPI, Depends, File, UploadFile, Query, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, JSONResponse
from pydantic import BaseModel

from app.config import ALLOWED_ORIGINS, PORT, BASE_DIR
from app.auth import (
    verify_admin_credentials,
    create_access_token,
    get_current_admin,
)
from app.r2_client import (
    upload_bytes,
    list_project_assets,
    save_projects_json,
    load_projects_json,
    get_public_url,
)

# Root directory of the repository (parent of backend/)
REPO_ROOT = BASE_DIR.parent

app = FastAPI(
    title="BuiltByJimi Portfolio API & Studio CMS",
    description="Backend API supporting Cloudflare R2 media storage, admin authentication, and CMS management.",
    version="2.0.0",
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"] if "*" in ALLOWED_ORIGINS else ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# --------------------------------------------------------------------------
# Schemas
# --------------------------------------------------------------------------
class LoginRequest(BaseModel):
    username: str
    password: str


class SaveProjectsRequest(BaseModel):
    projects: Dict[str, Any]


# --------------------------------------------------------------------------
# Helper Functions
# --------------------------------------------------------------------------
def read_local_projects_config() -> Dict[str, Any]:
    """Reads projects configuration from js/projects-config.js if present."""
    config_path = REPO_ROOT / "js" / "projects-config.js"
    if not config_path.exists():
        return {}

    with open(config_path, "r", encoding="utf-8") as f:
        content = f.read()

    match = re.search(r"export\s+const\s+PROJECTS_CONFIG\s*=\s*(\{[\s\S]*?\n\};)", content)
    if not match:
        return {}

    js_obj = match.group(1).rstrip(";")
    try:
        return json.loads(js_obj)
    except Exception:
        pass

    try:
        cleaned = re.sub(r"([{,]\s*)([a-zA-Z0-9_]+)\s*:", r'\1"\2":', js_obj)
        cleaned = re.sub(r",\s*([}\]])", r"\1", cleaned)
        return json.loads(cleaned)
    except Exception:
        return {}


def write_local_projects_config(config_dict: Dict[str, Any]):
    """Optionally synchronizes js/projects-config.js and js/projects-data.js when running locally."""
    config_path = REPO_ROOT / "js" / "projects-config.js"
    data_path = REPO_ROOT / "js" / "projects-data.js"

    if not config_path.parent.exists():
        return

    formatted_json = json.dumps(config_dict, indent=2, ensure_ascii=False)
    js_content = f"""/**
 * BUILTBYJIMI - UNIFIED PROJECTS & CASE STUDIES CONFIGURATION
 * Single source of truth for all projects across portfolio, detail pages, and CMS dashboard.
 */

export const PROJECTS_CONFIG = {formatted_json};

export function getProjectsList() {{
  return Object.values(PROJECTS_CONFIG).map(p => ({{
    id: p.id,
    number: p.number,
    title: p.title,
    subtitle: p.subtitle,
    industry: p.industry,
    role: p.services ? p.services.slice(0, 3).join(' | ') : '',
    categories: p.categories || [],
    image: p.thumbnail,
    isLive: Boolean(p.isLive !== undefined ? p.isLive : (p.id === 'becht' || p.id === 'asiancooks')),
    link: Boolean(p.isLive !== undefined ? p.isLive : (p.id === 'becht' || p.id === 'asiancooks')) ? `/${{p.id}}` : null
  }}));
}}

export function getProjectsDetailData() {{
  const result = {{}};
  const entries = Object.entries(PROJECTS_CONFIG);

  entries.forEach(([key, project], idx) => {{
    const nextKey = project.nextProjectId || (idx + 1 < entries.length ? entries[idx + 1][0] : entries[0][0]);
    const nextProjectObj = PROJECTS_CONFIG[nextKey] || entries[0][1];

    result[key] = {{
      ...project,
      nextProject: {{
        id: nextProjectObj.id,
        title: nextProjectObj.title,
        subtitle: nextProjectObj.subtitle,
        cardImage: nextProjectObj.thumbnail
      }}
    }};
  }});

  return result;
}}
"""
    try:
        with open(config_path, "w", encoding="utf-8") as f:
            f.write(js_content)
    except Exception as e:
        print(f"Could not write local projects-config.js: {e}")


# --------------------------------------------------------------------------
# API Routes
# --------------------------------------------------------------------------
@app.get("/api/health")
def health_check():
    return {"status": "ok", "service": "BuiltByJimi Portfolio API"}


@app.post("/api/auth/login")
def login(creds: LoginRequest):
    if not verify_admin_credentials(creds.username, creds.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect admin username or password",
        )
    token = create_access_token(creds.username)
    return {
        "status": "success",
        "token": token,
        "tokenType": "bearer",
        "username": creds.username,
    }


@app.get("/api/auth/me")
def check_auth_status(current_admin: str = Depends(get_current_admin)):
    return {"status": "authenticated", "username": current_admin}


@app.get("/api/projects")
def get_projects():
    """Returns project configuration: checks R2 first, falls back to local configuration."""
    r2_data = load_projects_json()
    if r2_data:
        return {"status": "success", "source": "r2", "projects": r2_data}

    local_data = read_local_projects_config()
    return {"status": "success", "source": "local", "projects": local_data}


@app.post("/api/save")
def save_projects(
    payload: SaveProjectsRequest,
    current_admin: str = Depends(get_current_admin),
):
    """Saves updated project config: uploads to R2 and writes local file if available."""
    projects = payload.projects
    saved_r2_url = None

    try:
        saved_r2_url = save_projects_json(projects)
    except Exception as e:
        print(f"R2 save notice: {e}")

    write_local_projects_config(projects)

    return {
        "status": "success",
        "message": "Configuration saved successfully",
        "r2Url": saved_r2_url,
    }


@app.get("/api/assets")
def get_assets(
    project: str = Query(..., description="Project ID"),
    current_admin: str = Depends(get_current_admin),
):
    """Lists project assets stored in Cloudflare R2."""
    r2_assets = list_project_assets(project)
    return {"status": "success", "project": project, "files": r2_assets}


@app.post("/api/upload")
async def upload_asset(
    project: str = Query(..., description="Project ID"),
    filename: Optional[str] = Query(None, description="Filename override"),
    file: UploadFile = File(None),
    current_admin: str = Depends(get_current_admin),
):
    """Uploads file directly to Cloudflare R2 under assets/projects/assets/{project}/{filename}."""
    if file:
        file_bytes = await file.read()
        target_name = filename or file.filename or "upload"
        content_type = file.content_type
    else:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No file provided in upload request",
        )

    clean_filename = os.path.basename(target_name)
    r2_key = f"assets/projects/assets/{project}/{clean_filename}"

    try:
        result = upload_bytes(file_bytes, r2_key, content_type=content_type)
        return {
            "status": "success",
            "message": f"File {clean_filename} uploaded to R2 successfully",
            "name": clean_filename,
            "relPath": result["key"],
            "url": result["url"],
            "size": result["size"],
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Upload failed: {str(e)}",
        )


# --------------------------------------------------------------------------
# Static Files & Dashboard Mount (For hosting Dashboard directly on Render)
# --------------------------------------------------------------------------
if (REPO_ROOT / "css").exists():
    app.mount("/css", StaticFiles(directory=str(REPO_ROOT / "css")), name="css")
if (REPO_ROOT / "js").exists():
    app.mount("/js", StaticFiles(directory=str(REPO_ROOT / "js")), name="js")

@app.get("/dashboard")
@app.get("/dashboard.html")
def serve_dashboard():
    dashboard_file = REPO_ROOT / "dashboard.html"
    if dashboard_file.exists():
        return FileResponse(dashboard_file)
    return JSONResponse({"status": "error", "message": "dashboard.html not found"}, status_code=404)
