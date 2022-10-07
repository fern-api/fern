import typing

import pydantic
import typing_extensions


class WebSocketOperationProperties(pydantic.BaseModel):
    id: str
    operation: str
    body: str

    @pydantic.validator("id")
    def _validate_id(cls, id: str) -> str:
        for validator in WebSocketOperationProperties.Validators._id:
            id = validator(id)
        return id

    @pydantic.validator("operation")
    def _validate_operation(cls, operation: str) -> str:
        for validator in WebSocketOperationProperties.Validators._operation:
            operation = validator(operation)
        return operation

    @pydantic.validator("body")
    def _validate_body(cls, body: str) -> str:
        for validator in WebSocketOperationProperties.Validators._body:
            body = validator(body)
        return body

    class Validators:
        _id: typing.ClassVar[typing.List[typing.Callable[[str], str]]] = []
        _operation: typing.ClassVar[typing.List[typing.Callable[[str], str]]] = []
        _body: typing.ClassVar[typing.List[typing.Callable[[str], str]]] = []

        @typing.overload
        @classmethod
        def field(
            cls, field_name: typing_extensions.Literal["id"]
        ) -> typing.Callable[[typing.Callable[[str], str]], typing.Callable[[str], str]]:
            ...

        @typing.overload
        @classmethod
        def field(
            cls, field_name: typing_extensions.Literal["operation"]
        ) -> typing.Callable[[typing.Callable[[str], str]], typing.Callable[[str], str]]:
            ...

        @typing.overload
        @classmethod
        def field(
            cls, field_name: typing_extensions.Literal["body"]
        ) -> typing.Callable[[typing.Callable[[str], str]], typing.Callable[[str], str]]:
            ...

        @classmethod
        def field(cls, field_name: str) -> typing.Any:
            def decorator(validator: typing.Any) -> typing.Any:
                if field_name == "id":
                    cls._id.append(validator)
                elif field_name == "operation":
                    cls._operation.append(validator)
                elif field_name == "body":
                    cls._body.append(validator)
                else:
                    raise RuntimeError("Field does not exist on WebSocketOperationProperties: " + field_name)

                return validator

            return decorator

    def json(self, **kwargs: typing.Any) -> str:
        kwargs_with_defaults: typing.Any = {"by_alias": True, **kwargs}
        return super().json(**kwargs_with_defaults)

    class Config:
        frozen = True
