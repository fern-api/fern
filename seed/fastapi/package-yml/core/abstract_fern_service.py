# This file was auto-generated by Fern from our API Definition.

import abc

import fastapi


class AbstractFernService(abc.ABC):
    @classmethod
    def _init_fern(cls, router: fastapi.APIRouter) -> None: ...
