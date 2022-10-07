from __future__ import annotations

import typing

import pydantic
import typing_extensions

from .test_submission_status_v_2 import TestSubmissionStatusV2
from .workspace_submission_status_v_2 import WorkspaceSubmissionStatusV2

T_Result = typing.TypeVar("T_Result")


class _Factory:
    def test(self, value: TestSubmissionStatusV2) -> SubmissionStatusV2:
        return SubmissionStatusV2(__root__=_SubmissionStatusV2.Test(**dict(value), type="test"))

    def workspace(self, value: WorkspaceSubmissionStatusV2) -> SubmissionStatusV2:
        return SubmissionStatusV2(__root__=_SubmissionStatusV2.Workspace(**dict(value), type="workspace"))


class SubmissionStatusV2(pydantic.BaseModel):
    factory: typing.ClassVar[_Factory] = _Factory()

    def get_as_union(self) -> typing.Union[_SubmissionStatusV2.Test, _SubmissionStatusV2.Workspace]:
        return self.__root__

    def visit(
        self,
        test: typing.Callable[[TestSubmissionStatusV2], T_Result],
        workspace: typing.Callable[[WorkspaceSubmissionStatusV2], T_Result],
    ) -> T_Result:
        if self.__root__.type == "test":
            return test(self.__root__)
        if self.__root__.type == "workspace":
            return workspace(self.__root__)

    __root__: typing_extensions.Annotated[
        typing.Union[_SubmissionStatusV2.Test, _SubmissionStatusV2.Workspace], pydantic.Field(discriminator="type")
    ]

    @pydantic.root_validator
    def _validate(cls, values: typing.Dict[str, typing.Any]) -> typing.Dict[str, typing.Any]:
        value = typing.cast(
            typing.Union[_SubmissionStatusV2.Test, _SubmissionStatusV2.Workspace], values.get("__root__")
        )
        for validator in SubmissionStatusV2.Validators._validators:
            value = validator(value)
        return {**values, "__root__": value}

    class Validators:
        _validators: typing.ClassVar[
            typing.List[
                typing.Callable[
                    [typing.Union[_SubmissionStatusV2.Test, _SubmissionStatusV2.Workspace]],
                    typing.Union[_SubmissionStatusV2.Test, _SubmissionStatusV2.Workspace],
                ]
            ]
        ] = []

        @classmethod
        def validate(
            cls,
            validator: typing.Callable[
                [typing.Union[_SubmissionStatusV2.Test, _SubmissionStatusV2.Workspace]],
                typing.Union[_SubmissionStatusV2.Test, _SubmissionStatusV2.Workspace],
            ],
        ) -> None:
            cls._validators.append(validator)

    def json(self, **kwargs: typing.Any) -> str:
        kwargs_with_defaults: typing.Any = {"by_alias": True, **kwargs}
        return super().json(**kwargs_with_defaults)

    def dict(self, **kwargs: typing.Any) -> typing.Dict[str, typing.Any]:
        kwargs_with_defaults: typing.Any = {"by_alias": True, **kwargs}
        return super().json(**kwargs_with_defaults)

    class Config:
        frozen = True


class _SubmissionStatusV2:
    class Test(TestSubmissionStatusV2):
        type: typing_extensions.Literal["test"]

        class Config:
            frozen = True

    class Workspace(WorkspaceSubmissionStatusV2):
        type: typing_extensions.Literal["workspace"]

        class Config:
            frozen = True


SubmissionStatusV2.update_forward_refs()
