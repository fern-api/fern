import enum
import typing

T_Result = typing.TypeVar("T_Result")


class HttpMethod(str, enum.Enum):
    GET = "GET"
    POST = "POST"
    PUT = "PUT"
    PATCH = "PATCH"
    DELETE = "DELETE"

    def visit(
        self,
        get: typing.Callable[[], T_Result],
        post: typing.Callable[[], T_Result],
        put: typing.Callable[[], T_Result],
        patch: typing.Callable[[], T_Result],
        delete: typing.Callable[[], T_Result],
    ) -> T_Result:
        if self.value == "GET":
            return get()
        if self.value == "POST":
            return post()
        if self.value == "PUT":
            return put()
        if self.value == "PATCH":
            return patch()
        if self.value == "DELETE":
            return delete()

        # the above checks are exhaustive, but this is necessary to satisfy the type checker
        raise RuntimeError()
