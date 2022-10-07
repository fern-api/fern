import typing

import pydantic
import typing_extensions

from .submission_id import SubmissionId


class SubmissionIdNotFound(pydantic.BaseModel):
    missing_submission_id: SubmissionId = pydantic.Field(alias="missingSubmissionId")

    @pydantic.validator("missing_submission_id")
    def _validate_missing_submission_id(cls, missing_submission_id: SubmissionId) -> SubmissionId:
        for validator in SubmissionIdNotFound.Validators._missing_submission_id:
            missing_submission_id = validator(missing_submission_id)
        return missing_submission_id

    class Validators:
        _missing_submission_id: typing.ClassVar[typing.List[typing.Callable[[SubmissionId], SubmissionId]]] = []

        @typing.overload  # type: ignore
        @classmethod
        def field(
            cls, field_name: typing_extensions.Literal["missing_submission_id"]
        ) -> typing.Callable[
            [typing.Callable[[SubmissionId], SubmissionId]], typing.Callable[[SubmissionId], SubmissionId]
        ]:
            ...

        @classmethod
        def field(cls, field_name: str) -> typing.Any:
            def decorator(validator: typing.Any) -> typing.Any:
                if field_name == "missing_submission_id":
                    cls._missing_submission_id.append(validator)
                else:
                    raise RuntimeError("Field does not exist on SubmissionIdNotFound: " + field_name)

                return validator

            return decorator

    def json(self, **kwargs: typing.Any) -> str:
        kwargs_with_defaults: typing.Any = {"by_alias": True, **kwargs}
        return super().json(**kwargs_with_defaults)

    class Config:
        frozen = True
        allow_population_by_field_name = True
