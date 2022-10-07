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
        _session_id: typing.ClassVar[typing.List[typing.Callable[[str], str]]] = []
        _execution_session_url: typing.ClassVar[
            typing.List[typing.Callable[[typing.Optional[str]], typing.Optional[str]]]
        ] = []
        _language: typing.ClassVar[typing.List[typing.Callable[[Language], Language]]] = []
        _status: typing.ClassVar[typing.List[typing.Callable[[ExecutionSessionStatus], ExecutionSessionStatus]]] = []

        @typing.overload
        @classmethod
        def field(
            cls, field_name: typing_extensions.Literal["session_id"]
        ) -> typing.Callable[[typing.Callable[[str], str]], typing.Callable[[str], str]]:
            ...

        @typing.overload
        @classmethod
        def field(
            cls, field_name: typing_extensions.Literal["execution_session_url"]
        ) -> typing.Callable[
            [typing.Callable[[typing.Optional[str]], typing.Optional[str]]],
            typing.Callable[[typing.Optional[str]], typing.Optional[str]],
        ]:
            ...

        @typing.overload
        @classmethod
        def field(
            cls, field_name: typing_extensions.Literal["language"]
        ) -> typing.Callable[[typing.Callable[[Language], Language]], typing.Callable[[Language], Language]]:
            ...

        @typing.overload
        @classmethod
        def field(
            cls, field_name: typing_extensions.Literal["status"]
        ) -> typing.Callable[
            [typing.Callable[[ExecutionSessionStatus], ExecutionSessionStatus]],
            typing.Callable[[ExecutionSessionStatus], ExecutionSessionStatus],
        ]:
            ...

        @classmethod
        def field(cls, field_name: str) -> typing.Any:
            def decorator(validator: typing.Any) -> typing.Any:
                if field_name == "session_id":
                    cls._session_id.append(validator)
                elif field_name == "execution_session_url":
                    cls._execution_session_url.append(validator)
                elif field_name == "language":
                    cls._language.append(validator)
                elif field_name == "status":
                    cls._status.append(validator)
                else:
                    raise RuntimeError("Field does not exist on ExecutionSessionResponse: " + field_name)

                return validator

            return decorator

    def json(self, **kwargs: typing.Any) -> str:
        kwargs_with_defaults: typing.Any = {"by_alias": True, **kwargs}
        return super().json(**kwargs_with_defaults)

    def dict(self, **kwargs: typing.Any) -> typing.Dict[str, typing.Any]:
        kwargs_with_defaults: typing.Any = {"by_alias": True, **kwargs}
        return super().json(**kwargs_with_defaults)

    class Config:
        frozen = True
        allow_population_by_field_name = True
