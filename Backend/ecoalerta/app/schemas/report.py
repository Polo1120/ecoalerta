import uuid
from datetime import datetime

from pydantic import BaseModel, Field, HttpUrl, field_validator

from app.models.report import ReportStatus
from app.schemas.user import UserPublic


class ReportBase(BaseModel):
    title: str = Field(..., min_length=5, max_length=200, examples=["Basura acumulada en parque"])
    description: str = Field(..., min_length=10, examples=["Lleva más de una semana sin recoger..."])
    latitude: float = Field(..., ge=-90, le=90, examples=[7.0728])
    longitude: float = Field(..., ge=-180, le=180, examples=[-73.1126])
    image_url: str | None = Field(None, examples=["https://cdn.example.com/foto.jpg"])


class ReportCreate(ReportBase):
    pass


class ReportStatusUpdate(BaseModel):
    status: ReportStatus


class ReportPublic(ReportBase):
    id: uuid.UUID
    status: ReportStatus
    created_at: datetime
    updated_at: datetime
    user_id: uuid.UUID

    model_config = {"from_attributes": True}


class ReportDetail(ReportPublic):
    """Extended response that includes author information."""
    author: UserPublic


class PaginatedReports(BaseModel):
    total: int
    page: int
    page_size: int
    results: list[ReportPublic]
