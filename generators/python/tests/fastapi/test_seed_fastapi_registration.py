import importlib
import inspect
import sys
import types
import typing
from pathlib import Path

import fastapi


def _find_seed_fastapi_root() -> Path:
    """
    Finds `<repo-root>/seed/fastapi` from this test file location.
    """
    current = Path(__file__).resolve()
    for parent in current.parents:
        candidate = parent / "seed" / "fastapi"
        if candidate.exists():
            return candidate
    raise RuntimeError("Could not locate seed/fastapi directory from test path")


def _instantiate_concrete(abstract_cls: type) -> object:
    """
    Creates an instantiable subclass without changing method signatures (critical for FastAPI inspection).
    We intentionally do not override abstract methods; the tests only validate registration & OpenAPI generation.
    """
    namespace: dict[str, typing.Any] = {"__module__": abstract_cls.__module__}

    # Define concrete stubs for every abstract method using the *same* signature.
    for method_name in getattr(abstract_cls, "__abstractmethods__", set()):
        abstract_attr = inspect.getattr_static(abstract_cls, method_name)
        # Most generated services use regular instance methods, but support classmethod/staticmethod defensively.
        if isinstance(abstract_attr, (classmethod, staticmethod)):
            fn = abstract_attr.__func__
        else:
            fn = abstract_attr

        if not isinstance(fn, types.FunctionType):
            raise TypeError(f"Unsupported abstract member type for {abstract_cls.__name__}.{method_name}: {type(fn)}")

        # Copy the function so we can clear the abstract flag without mutating the base class.
        new_fn = types.FunctionType(
            fn.__code__,
            fn.__globals__,
            name=fn.__name__,
            argdefs=fn.__defaults__,
            closure=fn.__closure__,
        )
        new_fn.__kwdefaults__ = fn.__kwdefaults__
        new_fn.__annotations__ = dict(getattr(fn, "__annotations__", {}))
        new_fn.__dict__.update(getattr(fn, "__dict__", {}))
        new_fn.__qualname__ = fn.__qualname__
        new_fn.__isabstractmethod__ = False  # type: ignore[attr-defined]

        if isinstance(abstract_attr, classmethod):
            namespace[method_name] = classmethod(new_fn)
        elif isinstance(abstract_attr, staticmethod):
            namespace[method_name] = staticmethod(new_fn)
        else:
            namespace[method_name] = new_fn

    concrete = type(f"Concrete{abstract_cls.__name__}", (abstract_cls,), namespace)
    return concrete()


def test_seed_examples_register_and_openapi_works_and_uses_annotated_body() -> None:
    seed_fastapi_root = _find_seed_fastapi_root()
    sys.path.insert(0, str(seed_fastapi_root))
    try:
        examples_register = typing.cast(typing.Any, importlib.import_module("examples.no_custom_config.register"))

        # Re-exported in examples.register
        AbstractRootService = typing.cast(type, getattr(examples_register, "AbstractRootService"))
        AbstractFileNotificationServiceService = typing.cast(
            type, getattr(examples_register, "AbstractFileNotificationServiceService")
        )
        AbstractFileServiceService = typing.cast(type, getattr(examples_register, "AbstractFileServiceService"))
        AbstractHealthServiceService = typing.cast(type, getattr(examples_register, "AbstractHealthServiceService"))
        AbstractServiceService = typing.cast(type, getattr(examples_register, "AbstractServiceService"))

        root = _instantiate_concrete(AbstractRootService)
        file_notification_service = _instantiate_concrete(AbstractFileNotificationServiceService)
        file_service = _instantiate_concrete(AbstractFileServiceService)
        health_service = _instantiate_concrete(AbstractHealthServiceService)
        service = _instantiate_concrete(AbstractServiceService)

        app = fastapi.FastAPI()
        examples_register.register(
            app,
            root=root,
            file_notification_service=file_notification_service,
            file_service=file_service,
            health_service=health_service,
            service=service,
        )

        # If signature patching / dependency extraction breaks, OpenAPI generation tends to fail loudly.
        openapi = app.openapi()
        assert "/" in openapi["paths"]

        # Validate that our generated __init_* signature patching for request body uses Annotated metadata.
        # (This is the key behavioral change we made in the generator.)
        sig = inspect.signature(getattr(type(root), "echo"))
        body_param = sig.parameters["body"]
        assert typing.get_origin(body_param.annotation) is typing.Annotated
        metadata = typing.get_args(body_param.annotation)[1]
        assert isinstance(metadata, fastapi.params.Body)

        # Validate aliasing works for headers in the nested `examples.resources.service` service.
        # This is a frequent real-world source of bugs since Python identifiers can't represent
        # canonical header names like `X-API-Version`.
        nested_sig = inspect.signature(getattr(type(service), "get_metadata"))
        header_param = nested_sig.parameters["x_api_version"]
        assert typing.get_origin(header_param.annotation) is typing.Annotated
        header_metadata = typing.get_args(header_param.annotation)[1]
        assert isinstance(header_metadata, fastapi.params.Header)
        assert getattr(header_metadata, "alias") == "X-API-Version"

        openapi_params = openapi["paths"]["/metadata"]["get"]["parameters"]
        header_openapi = next(p for p in openapi_params if p["in"] == "header" and p["name"] == "X-API-Version")
        assert header_openapi["required"] is True

        query_param_names = {p["name"] for p in openapi_params if p["in"] == "query"}
        assert {"shallow", "tag"} <= query_param_names
    finally:
        # Be a good citizen for other tests
        sys.path.remove(str(seed_fastapi_root))


def test_seed_validation_register_and_openapi_works_and_uses_annotated_query() -> None:
    seed_fastapi_root = _find_seed_fastapi_root()
    sys.path.insert(0, str(seed_fastapi_root))
    try:
        validation_register = typing.cast(typing.Any, importlib.import_module("validation.register"))

        AbstractRootService = typing.cast(type, getattr(validation_register, "AbstractRootService"))
        root = _instantiate_concrete(AbstractRootService)

        app = fastapi.FastAPI()
        validation_register.register(app, root=root)

        openapi = app.openapi()
        assert "/" in openapi["paths"]
        params = openapi["paths"]["/"]["get"]["parameters"]
        # decimal/even/name are required query params in this fixture
        assert {p["name"] for p in params} >= {"decimal", "even", "name"}

        sig = inspect.signature(getattr(type(root), "get"))
        for name in ["decimal", "even", "name"]:
            p = sig.parameters[name]
            assert typing.get_origin(p.annotation) is typing.Annotated
            metadata = typing.get_args(p.annotation)[1]
            assert isinstance(metadata, fastapi.params.Query)
    finally:
        sys.path.remove(str(seed_fastapi_root))


def test_seed_optional_register_and_openapi_works_and_optional_body_default_preserved() -> None:
    seed_fastapi_root = _find_seed_fastapi_root()
    sys.path.insert(0, str(seed_fastapi_root))
    try:
        optional_register = typing.cast(typing.Any, importlib.import_module("optional.register"))

        AbstractOptionalService = typing.cast(type, getattr(optional_register, "AbstractOptionalService"))
        optional_service = _instantiate_concrete(AbstractOptionalService)

        app = fastapi.FastAPI()
        optional_register.register(app, optional=optional_service)

        openapi = app.openapi()
        assert "/send-optional-body" in openapi["paths"]

        # This fixture has an optional body with default None. The signature patch must NOT
        # overwrite that with Body(...), otherwise FastAPI treats it as required.
        sig = inspect.signature(getattr(type(optional_service), "send_optional_body"))
        body_param = sig.parameters["body"]
        assert body_param.default is None
        assert typing.get_origin(body_param.annotation) is typing.Annotated
        metadata = typing.get_args(body_param.annotation)[1]
        assert isinstance(metadata, fastapi.params.Body)
    finally:
        sys.path.remove(str(seed_fastapi_root))
