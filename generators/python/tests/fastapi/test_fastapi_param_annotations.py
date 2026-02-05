import inspect
import typing

import fastapi
from fastapi.testclient import TestClient


def _apply_fern_style_signature_patch(
    fn: typing.Callable[..., typing.Any],
    *,
    param_name: str,
    marker: typing.Any,
    default: typing.Any = inspect._empty,
) -> None:
    """
    Mirrors what our generated service __init_* methods do:
    - attach FastAPI marker via typing.Annotated[T, marker]
    - use Python defaults (e.g. None / []) separately, rather than marker(default=...)
    """
    sig = inspect.signature(fn)
    new_params: list[inspect.Parameter] = []
    for name, p in sig.parameters.items():
        if name != param_name:
            new_params.append(p)
            continue

        # This is intentionally dynamic: we're taking the runtime annotation from an inspect.Parameter
        # and wrapping it in typing.Annotated for FastAPI. Static type checkers don't love this,
        # but it's correct behavior at runtime.
        base_annotation = typing.cast(typing.Any, p.annotation)
        new_annotation = typing.Annotated[base_annotation, marker]  # type: ignore[misc,valid-type]
        if default is inspect._empty:
            new_params.append(p.replace(annotation=new_annotation))
        else:
            new_params.append(p.replace(annotation=new_annotation, default=default))

    # setattr avoids type-checker complaints about __signature__ not being a formal attribute on Callable
    setattr(fn, "__signature__", sig.replace(parameters=new_params))


def test_query_optional_annotated_with_python_default_none_parses() -> None:
    app = fastapi.FastAPI()

    def endpoint(q: typing.Optional[str] = None) -> dict[str, typing.Any]:
        return {"q": q}

    _apply_fern_style_signature_patch(endpoint, param_name="q", marker=fastapi.Query(max_length=50), default=None)
    app.get("/")(endpoint)

    client = TestClient(app)
    assert client.get("/").json() == {"q": None}
    assert client.get("/?q=hello").json() == {"q": "hello"}

    # OpenAPI should show q as not required (since default is None) and preserve max_length constraint
    openapi = app.openapi()
    params = openapi["paths"]["/"]["get"]["parameters"]
    q_param = next(p for p in params if p["name"] == "q")
    assert q_param["required"] is False

    # Schema shape differs across FastAPI/Pydantic versions (e.g. anyOf vs nullable),
    # so assert the constraint exists somewhere within the schema.
    def _collect_values_for_key(obj: typing.Any, key: str) -> typing.List[typing.Any]:
        values: typing.List[typing.Any] = []
        if isinstance(obj, dict):
            for k, v in obj.items():
                if k == key:
                    values.append(v)
                values.extend(_collect_values_for_key(v, key))
        elif isinstance(obj, list):
            for item in obj:
                values.extend(_collect_values_for_key(item, key))
        return values

    assert 50 in _collect_values_for_key(q_param["schema"], "maxLength")


def test_query_required_annotated_without_default_is_required() -> None:
    app = fastapi.FastAPI()

    def endpoint(q: str) -> dict[str, typing.Any]:
        return {"q": q}

    _apply_fern_style_signature_patch(endpoint, param_name="q", marker=fastapi.Query(max_length=50))
    app.get("/")(endpoint)

    client = TestClient(app)
    # Missing required query param -> validation error
    assert client.get("/").status_code == 422
    assert client.get("/?q=hello").json() == {"q": "hello"}

    openapi = app.openapi()
    params = openapi["paths"]["/"]["get"]["parameters"]
    q_param = next(p for p in params if p["name"] == "q")
    assert q_param["required"] is True
    assert q_param["schema"]["maxLength"] == 50


def test_path_param_annotated_parses_and_is_required() -> None:
    app = fastapi.FastAPI()

    def endpoint(user_id: str) -> dict[str, typing.Any]:
        return {"user_id": user_id}

    _apply_fern_style_signature_patch(endpoint, param_name="user_id", marker=fastapi.Path(description="User id"))
    app.get("/users/{user_id}")(endpoint)

    client = TestClient(app)
    assert client.get("/users/abc").json() == {"user_id": "abc"}

    openapi = app.openapi()
    params = openapi["paths"]["/users/{user_id}"]["get"]["parameters"]
    p = next(p for p in params if p["name"] == "user_id")
    assert p["in"] == "path"
    assert p["required"] is True


def test_pydantic_v1_module_present_does_not_break_annotated_query_parsing() -> None:
    import pydantic.v1  # noqa: F401

    app = fastapi.FastAPI()

    def endpoint(q: typing.Optional[str] = None) -> dict[str, typing.Any]:
        return {"q": q}

    _apply_fern_style_signature_patch(endpoint, param_name="q", marker=fastapi.Query(max_length=50), default=None)
    app.get("/")(endpoint)

    client = TestClient(app)
    assert client.get("/").status_code == 200
    assert client.get("/").json() == {"q": None}
    assert client.get("/?q=hello").json() == {"q": "hello"}
