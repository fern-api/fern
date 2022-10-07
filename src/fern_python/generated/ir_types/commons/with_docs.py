import typing

import pydantic
import typing_extensions


class WithDocs(pydantic.BaseModel):
    docs: typing.Optional[str]

    @pydantic.validator("docs")
    def _validate_docs(cls, docs: typing.Optional[str]) -> typing.Optional[str]:
        for validator in WithDocs.Validators._docs:
            docs = validator(docs)
        return docs

    class Validators:
        _docs: typing.ClassVar[typing.List[typing.Callable[[typing.Optional[str]], typing.Optional[str]]]] = []

        @typing.overload  # type: ignore
        @classmethod
        def field(
            cls, field_name: typing_extensions.Literal["docs"]
        ) -> typing.Callable[
            [typing.Callable[[typing.Optional[str]], typing.Optional[str]]],
            typing.Callable[[typing.Optional[str]], typing.Optional[str]],
        ]:
            ...

        @classmethod
        def field(cls, field_name: str) -> typing.Any:
            def decorator(validator: typing.Any) -> typing.Any:
                if field_name == "docs":
                    cls._docs.append(validator)
                else:
                    raise RuntimeError("Field does not exist on WithDocs: " + field_name)

                return validator

            return decorator

    def json(self, **kwargs: typing.Any) -> str:
        kwargs_with_defaults: typing.Any = {"by_alias": True, **kwargs}
        return super().json(**kwargs_with_defaults)

    class Config:
        frozen = True
