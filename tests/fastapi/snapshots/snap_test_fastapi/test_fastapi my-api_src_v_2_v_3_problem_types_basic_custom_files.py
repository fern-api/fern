import typing

import pydantic
import typing_extensions

from .....commons.types.language import Language
from .basic_test_case_template import BasicTestCaseTemplate
from .files import Files
from .non_void_function_signature import NonVoidFunctionSignature


class BasicCustomFiles(pydantic.BaseModel):
    method_name: str = pydantic.Field(alias="methodName")
    signature: NonVoidFunctionSignature
    additional_files: typing.Dict[Language, Files] = pydantic.Field(alias="additionalFiles")
    basic_test_case_template: BasicTestCaseTemplate = pydantic.Field(alias="basicTestCaseTemplate")

    @pydantic.validator("method_name")
    def _validate_method_name(cls, method_name: str) -> str:
        for validator in BasicCustomFiles.Validators._method_name:
            method_name = validator(method_name)
        return method_name

    @pydantic.validator("signature")
    def _validate_signature(cls, signature: NonVoidFunctionSignature) -> NonVoidFunctionSignature:
        for validator in BasicCustomFiles.Validators._signature:
            signature = validator(signature)
        return signature

    @pydantic.validator("additional_files")
    def _validate_additional_files(cls, additional_files: typing.Dict[Language, Files]) -> typing.Dict[Language, Files]:
        for validator in BasicCustomFiles.Validators._additional_files:
            additional_files = validator(additional_files)
        return additional_files

    @pydantic.validator("basic_test_case_template")
    def _validate_basic_test_case_template(
        cls, basic_test_case_template: BasicTestCaseTemplate
    ) -> BasicTestCaseTemplate:
        for validator in BasicCustomFiles.Validators._basic_test_case_template:
            basic_test_case_template = validator(basic_test_case_template)
        return basic_test_case_template

    class Validators:
        _method_name: typing.ClassVar[typing.List[typing.Callable[[str], str]]] = []
        _signature: typing.ClassVar[
            typing.List[typing.Callable[[NonVoidFunctionSignature], NonVoidFunctionSignature]]
        ] = []
        _additional_files: typing.ClassVar[
            typing.List[typing.Callable[[typing.Dict[Language, Files]], typing.Dict[Language, Files]]]
        ] = []
        _basic_test_case_template: typing.ClassVar[
            typing.List[typing.Callable[[BasicTestCaseTemplate], BasicTestCaseTemplate]]
        ] = []

        @typing.overload
        @classmethod
        def field(
            cls, field_name: typing_extensions.Literal["method_name"]
        ) -> typing.Callable[[typing.Callable[[str], str]], typing.Callable[[str], str]]:
            ...

        @typing.overload
        @classmethod
        def field(
            cls, field_name: typing_extensions.Literal["signature"]
        ) -> typing.Callable[
            [typing.Callable[[NonVoidFunctionSignature], NonVoidFunctionSignature]],
            typing.Callable[[NonVoidFunctionSignature], NonVoidFunctionSignature],
        ]:
            ...

        @typing.overload
        @classmethod
        def field(
            cls, field_name: typing_extensions.Literal["additional_files"]
        ) -> typing.Callable[
            [typing.Callable[[typing.Dict[Language, Files]], typing.Dict[Language, Files]]],
            typing.Callable[[typing.Dict[Language, Files]], typing.Dict[Language, Files]],
        ]:
            ...

        @typing.overload
        @classmethod
        def field(
            cls, field_name: typing_extensions.Literal["basic_test_case_template"]
        ) -> typing.Callable[
            [typing.Callable[[BasicTestCaseTemplate], BasicTestCaseTemplate]],
            typing.Callable[[BasicTestCaseTemplate], BasicTestCaseTemplate],
        ]:
            ...

        @classmethod
        def field(cls, field_name: str) -> typing.Any:
            def decorator(validator: typing.Any) -> typing.Any:
                if field_name == "method_name":
                    cls._method_name.append(validator)
                elif field_name == "signature":
                    cls._signature.append(validator)
                elif field_name == "additional_files":
                    cls._additional_files.append(validator)
                elif field_name == "basic_test_case_template":
                    cls._basic_test_case_template.append(validator)
                else:
                    raise RuntimeError("Field does not exist on BasicCustomFiles: " + field_name)

                return validator

            return decorator

    def json(self, **kwargs: typing.Any) -> str:
        kwargs_with_defaults: typing.Any = {"by_alias": True, **kwargs}
        return super().json(**kwargs_with_defaults)

    class Config:
        frozen = True
        allow_population_by_field_name = True
