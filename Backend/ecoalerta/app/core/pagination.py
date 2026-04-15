from dataclasses import dataclass
from typing import TypeVar, Generic, Sequence

from pydantic import BaseModel

T = TypeVar("T")


@dataclass
class PageParams:
    """Encapsulates validated pagination parameters."""
    page: int = 1
    page_size: int = 20

    @property
    def offset(self) -> int:
        return (self.page - 1) * self.page_size

    @property
    def limit(self) -> int:
        return self.page_size


class Page(BaseModel, Generic[T]):
    """
    Generic paginated response envelope.

    Usage::

        Page[ReportPublic](total=100, page=1, page_size=20, results=[...])
    """
    total: int
    page: int
    page_size: int
    total_pages: int
    results: Sequence[T]

    @classmethod
    def build(cls, results: Sequence[T], total: int, params: PageParams) -> "Page[T]":
        import math
        return cls(
            total=total,
            page=params.page,
            page_size=params.page_size,
            total_pages=math.ceil(total / params.page_size) if params.page_size else 0,
            results=results,
        )
