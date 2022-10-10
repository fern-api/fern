from __future__ import annotations

import abc

import fastapi


class AbstractFernService(abc.ABC):
    @classmethod
    def _init_fern(cls, router: fastapi.APIRouter) -> None:
        ...
