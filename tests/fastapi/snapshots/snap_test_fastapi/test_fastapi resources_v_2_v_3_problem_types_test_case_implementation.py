import typing

import pydantic
import typing_extensions

from .test_case_function import TestCaseFunction
from .test_case_implementation_description import TestCaseImplementationDescription


class TestCaseImplementation(pydantic.BaseModel):
    description: TestCaseImplementationDescription
    function: TestCaseFunction

    @pydantic.validator("description")
    def _validate_description(cls, description: TestCaseImplementationDescription) -> TestCaseImplementationDescription:
        for validator in TestCaseImplementation.Validators._description:
            description = validator(description)
        return description

    @pydantic.validator("function")
    def _validate_function(cls, function: TestCaseFunction) -> TestCaseFunction:
        for validator in TestCaseImplementation.Validators._function:
            function = validator(function)
        return function

    class Validators:
        _description: typing.ClassVar[
            typing.List[typing.Callable[[TestCaseImplementationDescription], TestCaseImplementationDescription]]
        ] = []
        _function: typing.ClassVar[typing.List[typing.Callable[[TestCaseFunction], TestCaseFunction]]] = []

        @typing.overload
        @classmethod
        def field(
            cls, field_name: typing_extensions.Literal["description"]
        ) -> typing.Callable[
            [typing.Callable[[TestCaseImplementationDescription], TestCaseImplementationDescription]],
            typing.Callable[[TestCaseImplementationDescription], TestCaseImplementationDescription],
        ]:
            ...

        @typing.overload
        @classmethod
        def field(
            cls, field_name: typing_extensions.Literal["function"]
        ) -> typing.Callable[
            [typing.Callable[[TestCaseFunction], TestCaseFunction]],
            typing.Callable[[TestCaseFunction], TestCaseFunction],
        ]:
            ...

        @classmethod
        def field(cls, field_name: str) -> typing.Any:
            def decorator(validator: typing.Any) -> typing.Any:
                if field_name == "description":
                    cls._description.append(validator)
                elif field_name == "function":
                    cls._function.append(validator)
                else:
                    raise RuntimeError("Field does not exist on TestCaseImplementation: " + field_name)

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
