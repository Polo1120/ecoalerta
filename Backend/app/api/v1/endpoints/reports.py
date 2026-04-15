import uuid
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.api.v1.deps import get_current_admin, get_current_user
from app.db.session import get_db
from app.models.report import ReportStatus
from app.models.user import User
from app.schemas.report import (
    PaginatedReports,
    ReportCreate,
    ReportDetail,
    ReportPublic,
    ReportStatusUpdate,
)
from app.services.report_service import ReportService

router = APIRouter(prefix="/reports", tags=["Reports"])


@router.post(
    "",
    response_model=ReportPublic,
    status_code=status.HTTP_201_CREATED,
    summary="Submit a new waste report",
)
def create_report(
    payload: ReportCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> ReportPublic:
    """
    Create a geolocated waste report. Requires authentication.

    - **latitude/longitude**: WGS-84 decimal degrees
    - **image_url**: Optional link to an uploaded image
    """
    return ReportService(db).create(payload, current_user)


@router.get(
    "",
    response_model=PaginatedReports,
    summary="List all reports (paginated)",
)
def list_reports(
    page: int = Query(1, ge=1, description="Page number (1-based)"),
    page_size: int = Query(20, ge=1, le=100, description="Items per page (max 100)"),
    status: ReportStatus | None = Query(None, description="Filter by status"),
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),  # require auth
) -> PaginatedReports:
    """Return a paginated list of reports, optionally filtered by **status**."""
    return ReportService(db).list_reports(page=page, page_size=page_size, status=status)


@router.get(
    "/{report_id}",
    response_model=ReportDetail,
    summary="Get report details",
)
def get_report(
    report_id: uuid.UUID,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
) -> ReportDetail:
    """Retrieve a single report including author information."""
    return ReportService(db).get_by_id(report_id)


@router.put(
    "/{report_id}/status",
    response_model=ReportPublic,
    summary="Update report status (admin only)",
)
def update_report_status(
    report_id: uuid.UUID,
    payload: ReportStatusUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin),
) -> ReportPublic:
    """
    Change the workflow status of a report.
    **Requires admin role.**

    Valid transitions: `pending` → `in_progress` → `resolved`
    """
    return ReportService(db).update_status(report_id, payload, current_user)
