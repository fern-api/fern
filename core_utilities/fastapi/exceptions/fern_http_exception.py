from __future__ import annotations

import abc
import http
import typing
import uuid

import fastapi
import pydantic


class FernHTTPException(fastapi.HTTPException, abc.ABC):
    def __init__(
        self,
        *,
        status_code: int,
        name: typing.Optional[str] = None,
        content: typing.Optional[typing.Any] = None,
    ):
        super().__init__(status_code=status_code)
        self.name = name
        self.status_code = status_code
        self.content = content

    class Body(pydantic.BaseModel):
        error_name: typing.Optional[str] = pydantic.Field(alias="_errorName")
        error_instance_id: uuid.UUID = pydantic.Field(alias="_errorInstanceId", default_factory=uuid.uuid4)
        content: typing.Optional[typing.Any]

        class Config:
            allow_population_by_field_name = True

    def to_json_response(self) -> fastapi.responses.JSONResponse:
        body = FernHTTPException.Body(
            error_name=self.name,
            content=self.content or http.HTTPStatus(self.status_code).phrase,
        )
        content = fastapi.encoders.jsonable_encoder(body, exclude_none=True)
        return fastapi.responses.JSONResponse(
            content=content,
            status_code=self.status_code,
        )
