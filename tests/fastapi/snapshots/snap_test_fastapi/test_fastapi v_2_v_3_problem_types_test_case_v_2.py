import typing

import pydantic
import typing_extensions

from .....commons.types.variable_value import VariableValue
from .parameter_id import ParameterId
from .test_case_expects import TestCaseExpects
from .test_case_implementation_reference import TestCaseImplementationReference
from .test_case_metadata import TestCaseMetadata


class TestCaseV2(pydantic.BaseModel):
    metadata: TestCaseMetadata
    implementation: TestCaseImplementationReference
    arguments: typing.Dict[ParameterId, VariableValue]
    expects: typing.Optional[TestCaseExpects]

    @pydantic.validator("metadata")
    def _validate_metadata(cls, metadata: TestCaseMetadata) -> TestCaseMetadata:
        for validator in TestCaseV2.Validators._metadata:
            metadata = validator(metadata)
        return metadata

    @pydantic.validator("implementation")
    def _validate_implementation(
        cls, implementation: TestCaseImplementationReference
    ) -> TestCaseImplementationReference:
        for validator in TestCaseV2.Validators._implementation:
            implementation = validator(implementation)
        return implementation

    @pydantic.validator("arguments")
    def _validate_arguments(
        cls, arguments: typing.Dict[ParameterId, VariableValue]
    ) -> typing.Dict[ParameterId, VariableValue]:
        for validator in TestCaseV2.Validators._arguments:
            arguments = validator(arguments)
        return arguments

    @pydantic.validator("expects")
    def _validate_expects(cls, expects: typing.Optional[TestCaseExpects]) -> typing.Optional[TestCaseExpects]:
        for validator in TestCaseV2.Validators._expects:
            expects = validator(expects)
        return expects

    class Validators:
        _metadata: typing.ClassVar[typing.List[typing.Callable[[TestCaseMetadata], TestCaseMetadata]]] = []
        _implementation: typing.ClassVar[
            typing.List[typing.Callable[[TestCaseImplementationReference], TestCaseImplementationReference]]
        ] = []
        _arguments: typing.ClassVar[
            typing.List[
                typing.Callable[[typing.Dict[ParameterId, VariableValue]], typing.Dict[ParameterId, VariableValue]]
            ]
        ] = []
        _expects: typing.ClassVar[
            typing.List[typing.Callable[[typing.Optional[TestCaseExpects]], typing.Optional[TestCaseExpects]]]
        ] = []

        @typing.overload
        @classmethod
        def field(
            cls, field_name: typing_extensions.Literal["metadata"]
        ) -> typing.Callable[
            [typing.Callable[[TestCaseMetadata], TestCaseMetadata]],
            typing.Callable[[TestCaseMetadata], TestCaseMetadata],
        ]:
            ...

        @typing.overload
        @classmethod
        def field(
            cls, field_name: typing_extensions.Literal["implementation"]
        ) -> typing.Callable[
            [typing.Callable[[TestCaseImplementationReference], TestCaseImplementationReference]],
            typing.Callable[[TestCaseImplementationReference], TestCaseImplementationReference],
        ]:
            ...

        @typing.overload
        @classmethod
        def field(
            cls, field_name: typing_extensions.Literal["arguments"]
        ) -> typing.Callable[
            [typing.Callable[[typing.Dict[ParameterId, VariableValue]], typing.Dict[ParameterId, VariableValue]]],
            typing.Callable[[typing.Dict[ParameterId, VariableValue]], typing.Dict[ParameterId, VariableValue]],
        ]:
            ...

        @typing.overload
        @classmethod
        def field(
            cls, field_name: typing_extensions.Literal["expects"]
        ) -> typing.Callable[
            [typing.Callable[[typing.Optional[TestCaseExpects]], typing.Optional[TestCaseExpects]]],
            typing.Callable[[typing.Optional[TestCaseExpects]], typing.Optional[TestCaseExpects]],
        ]:
            ...

        @classmethod
        def field(cls, field_name: str) -> typing.Any:
            def decorator(validator: typing.Any) -> typing.Any:
                if field_name == "metadata":
                    cls._metadata.append(validator)
                elif field_name == "implementation":
                    cls._implementation.append(validator)
                elif field_name == "arguments":
                    cls._arguments.append(validator)
                elif field_name == "expects":
                    cls._expects.append(validator)
                else:
                    raise RuntimeError("Field does not exist on TestCaseV2: " + field_name)

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
