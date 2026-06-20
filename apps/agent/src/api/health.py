"""Health endpoints."""

from fastapi import APIRouter

router = APIRouter()


@router.get("/healthz")
async def healthz():
    return {"ok": True, "version": "0.2.0", "agent": "claudecode"}


@router.get("/readyz")
async def readyz():
    return {"ok": True}
