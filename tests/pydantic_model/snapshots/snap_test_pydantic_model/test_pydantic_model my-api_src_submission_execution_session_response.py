import typing

import pydantic
import typing_extensions

from ..commons.language import Language
from .execution_session_status import ExecutionSessionStatus


class ExecutionSessionResponse(pydantic.BaseModel):
    session_id: str = pydantic.Field(alias="sessionId")
    execution_session_url: typing.Optional[str] = pydantic.Field(alias="executionSessionUrl")
    language: Language
    status: ExecutionSessionStatus

    @pydantic.validator("session_id")
    def _validate_session_id(cls, session_id: str) -> str:
        for validator in ExecutionSessionResponse.Validators._session_id:
            session_id = validator(session_id)
        return session_id

    @pydantic.validator("execution_session_url")
    def _validate_execution_session_url(cls, execution_session_url: typing.Optional[str]) -> typing.Optional[str]:
        for validator in ExecutionSessionResponse.Validators._execution_session_url:
            execution_session_url = validator(execution_session_url)
        return execution_session_url

    @pydantic.validator("language")
    def _validate_language(cls, language: Language) -> Language:
        for validator in ExecutionSessionResponse.Validators._language:
            language = validator(language)
        return language

    @pydantic.validator("status")
    def _validate_status(cls, status: ExecutionSessionStatus) -> ExecutionSessionStatus:
        for validator in ExecutionSessionResponse.Validators._status:
            status = validator(status)
        return status

    class Validators:
        _session_id: typing.ClassVar[str] = []
        _execution_session_url: typing.ClassVar[typing.Optional[str]] = []
        _language: typing.ClassVar[Language] = []
        _status: typing.ClassVar[ExecutionSessionStatus] = []

        @typing.overload
        @classmethod
        def field(session_id: typing_extensions.Literal["session_id"]) -> str:
            ...

        @typing.overload
        @classmethod
        def field(execution_session_url: typing_extensions.Literal["execution_session_url"]) -> typing.Optional[str]:
            ...

        @typing.overload
        @classmethod
        def field(language: typing_extensions.Literal["language"]) -> Language:
            ...

        @typing.overload
        @classmethod
        def field(status: typing_extensions.Literal["status"]) -> ExecutionSessionStatus:
            ...

        @classmethod
        def field(cls, field_name: str) -> typing.Any:
            def decorator(validator: typing.Any) -> typing.Any:
                if field_name == "session_id":
                    cls._session_id.append(validator)  # type: ignore
                elif field_name == "execution_session_url":
                    cls._execution_session_url.append(validator)  # type: ignore
                elif field_name == "language":
                    cls._language.append(validator)  # type: ignore
                elif field_name == "status":
                    cls._status.append(validator)  # type: ignore
                else:
                    raise RuntimeError("Field does not exist on ExecutionSessionResponse: " + field_name)

                return validator

            return validator  # type: ignore

    def json(self, **kwargs: typing.Any) -> str:
        kwargs_with_defaults: typing.Any = {"by_alias": True, **kwargs}
        return super().json(**kwargs_with_defaults)

    class Config:
        frozen = True
        allow_population_by_field_name = True
