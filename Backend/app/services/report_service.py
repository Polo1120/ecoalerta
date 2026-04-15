import uuid
from datetime import timezone, datetime

from sqlalchemy.orm import Session

from app.core.exceptions import ForbiddenException, NotFoundException
from app.models.report import Report
from app.models.user import User, UserRole
from app.schemas.report import (
    PaginatedReports,
    ReportCreate,
    ReportDetail,
    ReportPublic,
    ReportStatusUpdate,
)


class ReportService:
    def __init__(self, db: Session) -> None:
        self.db = db

    def create(self, payload: ReportCreate, current_user: User) -> ReportPublic:
        """Persist a new report filed by *current_user*."""
        report = Report(**payload.model_dump(), user_id=current_user.id)
        self.db.add(report)
        self.db.commit()
        self.db.refresh(report)
        return ReportPublic.model_validate(report)

    def list_reports(
        self,
        page: int = 1,
        page_size: int = 20,
        status: str | None = None,
    ) -> PaginatedReports:
        """
        Return a paginated list of reports, optionally filtered by status.

        Parameters
        ----------
        page:      1-based page number.
        page_size: Items per page (max 100).
        status:    Optional filter by ReportStatus value.
        """
        page_size = min(page_size, 100)  # cap page size
        query = self.db.query(Report)

        if status:
            query = query.filter(Report.status == status)

        total = query.count()
        reports = (
            query.order_by(Report.created_at.desc())
            .offset((page - 1) * page_size)
            .limit(page_size)
            .all()
        )

        return PaginatedReports(
            total=total,
            page=page,
            page_size=page_size,
            results=[ReportPublic.model_validate(r) for r in reports],
        )

    def get_by_id(self, report_id: uuid.UUID) -> ReportDetail:
        """Return a single report with author information. Raises 404 if absent."""
        report = self.db.get(Report, report_id)
        if report is None:
            raise NotFoundException("Report")
        return ReportDetail.model_validate(report)

    def update_status(
        self,
        report_id: uuid.UUID,
        payload: ReportStatusUpdate,
        current_user: User,
    ) -> ReportPublic:
        """
        Update the status of an existing report.
        Only admins may call this endpoint.
        """
        if current_user.role != UserRole.admin:
            raise ForbiddenException("Only admins can update report status.")

        report = self.db.get(Report, report_id)
        if report is None:
            raise NotFoundException("Report")

        report.status = payload.status
        report.updated_at = datetime.now(timezone.utc)
        self.db.commit()
        self.db.refresh(report)
        return ReportPublic.model_validate(report)
