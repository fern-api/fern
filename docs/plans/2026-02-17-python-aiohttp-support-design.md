# Python SDK Generator: Optional aiohttp Backend Support

**Date:** 2026-02-17
**Status:** Approved for Implementation
**Problem:** httpx DNS resolution failures under high async concurrency
**Solution:** Add optional aiohttp backend using httpx-aiohttp bridge

## Problem Statement

Fern-generated Python SDKs currently use httpx exclusively for HTTP requests. Under high async concurrency, httpx experiences DNS resolution failures due to a known limitation where `asyncio.getaddrinfo()` is secretly synchronous and uses a shared `ThreadPoolExecutor` that saturates under load.

**Symptoms:**
- `httpx.ConnectError: All connection attempts failed` under high async concurrency
- DNS requests queue up and time out when the thread pool saturates
- Affects customers like Cohere running high-concurrency async workloads

**Root Cause:**
- CPython issue [#112169](https://github.com/python/cpython/issues/112169) - marked as documentation-only fix
- httpx discussion [#3084](https://github.com/encode/httpx/discussions/3084) - no maintainer response
- Upgrading httpx/httpcore does not resolve the issue

## Solution Overview

Add **optional aiohttp backend support** to all Fern-generated Python SDKs using the `httpx-aiohttp` bridge package. This matches the proven approach used by OpenAI and Anthropic SDKs.

### Key Design Principles

1. **Zero Breaking Changes**: All existing httpx usage continues unchanged
2. **Opt-in Architecture**: Users must install `[aiohttp]` extra AND import the client class
3. **Transport-Layer Integration**: Uses `httpx-aiohttp` bridge - SDK remains httpx-native
4. **Reference Compatibility**: Matches OpenAI/Anthropic implementation patterns exactly

## Architecture

### High-Level Architecture

```
Generated SDK Structure:
├── pyproject.toml (+ aiohttp optional dependency)
├── __init__.py (+ DefaultAioHttpClient export)
├── core/
│   └── http_client.py (+ aiohttp wrapper classes)
└── client.py (existing httpx_client parameter works unchanged)

User Flow:
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│ pip install     │───▶│ import SDK +    │───▶│ Pass to existing│
│ sdk[aiohttp]    │    │ DefaultAioHttp  │    │ httpx_client=   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Integration Points

- **Core Utilities**: Extended `http_client.py` with aiohttp wrapper classes
- **Dependency Management**: `pyproject.toml` gains `[project.optional-dependencies]`
- **Export System**: `__init__.py` exports `DefaultAioHttpClient`
- **String Templating**: SDK package name templated into error messages

## Implementation Details

### Component 1: Core Utility Extension

**File:** `generators/python/core_utilities/shared/http_client.py`

Add aiohttp client wrapper classes:

```python
# New imports
from typing import TYPE_CHECKING
import httpx

# New constants
DEFAULT_TIMEOUT = httpx.Timeout(60.0)
DEFAULT_CONNECTION_LIMITS = httpx.Limits(max_connections=100, max_keepalive_connections=20)

# Conditional aiohttp client wrapper
try:
    import httpx_aiohttp
except ImportError:
    class _DefaultAioHttpClient(httpx.AsyncClient):
        def __init__(self, **_kwargs: Any) -> None:
            raise RuntimeError(
                "To use the aiohttp client you must have installed the package "
                "with the `aiohttp` extra, e.g.: pip install __FERN_SDK_PACKAGE__[aiohttp]"
            )
else:
    class _DefaultAioHttpClient(httpx_aiohttp.HttpxAiohttpClient):  # type: ignore
        def __init__(self, **kwargs: Any) -> None:
            kwargs.setdefault("timeout", DEFAULT_TIMEOUT)
            kwargs.setdefault("limits", DEFAULT_CONNECTION_LIMITS)
            kwargs.setdefault("follow_redirects", True)
            super().__init__(**kwargs)

# Public exports (with TYPE_CHECKING split for type checkers)
if TYPE_CHECKING:
    DefaultAsyncHttpxClient = httpx.AsyncClient
    DefaultAioHttpClient = httpx.AsyncClient
else:
    DefaultAsyncHttpxClient = httpx.AsyncClient
    DefaultAioHttpClient = _DefaultAioHttpClient
```

### Component 2: PyProject.toml Generation

**File:** `generators/python/src/fern_python/codegen/pyproject_toml.py`

Modify the `PyProjectToml.__init__()` method to automatically include aiohttp extra:

```python
# In __init__ method around line 66
self._extras = {
    **extras,  # User-provided extras
    "aiohttp": ["aiohttp", "httpx_aiohttp>=0.1.9"]  # Always add aiohttp support
}
```

### Component 3: Core Utilities Export Management

**File:** `generators/python/src/fern_python/generators/sdk/core_utilities/core_utilities.py`

Update `copy_to_project()` method:

```python
# Add exports and string templating
self._copy_file_to_project(
    project=project,
    relative_filepath_on_disk="http_client.py",
    filepath_in_project=Filepath(
        directories=(*self._project_module_path, "core"),
        file=Filename("http_client.py"),
    ),
    exports={
        "HttpClient",
        "AsyncHttpClient",
        "DefaultAsyncHttpxClient",  # New export
        "DefaultAioHttpClient"      # New export
    },
    string_replacements={
        "__FERN_SDK_PACKAGE__": self._get_package_name()
    }
)

def _get_package_name(self) -> str:
    """Get the PyPI package name for templating into error messages."""
    if self._custom_config.package_name:
        return self._custom_config.package_name
    return ".".join(self._project_module_path)
```

## User Experience

### Installation

```bash
# Standard installation (httpx only)
pip install my-sdk

# With aiohttp support
pip install my-sdk[aiohttp]
```

### Usage

**Standard usage (unchanged):**
```python
from my_sdk import AsyncClient

client = AsyncClient(api_key="...")  # Uses httpx by default
```

**With aiohttp (new capability):**
```python
from my_sdk import AsyncClient, DefaultAioHttpClient

client = AsyncClient(
    api_key="...",
    httpx_client=DefaultAioHttpClient()  # Uses aiohttp transport
)
```

### Runtime Behavior Matrix

| User Setup | Import Result | Runtime Behavior |
|------------|---------------|------------------|
| `pip install my-sdk` | `DefaultAioHttpClient` → Error class | Clear error if instantiated |
| `pip install my-sdk[aiohttp]` | `DefaultAioHttpClient` → Real class | Works with aiohttp transport |
| Any setup | Standard usage (no aiohttp) | Unchanged httpx behavior |

## Error Handling

### Missing Dependency Error

```python
RuntimeError: "To use the aiohttp client you must have installed the package with the `aiohttp` extra, e.g.: pip install my-sdk[aiohttp]"
```

### Other Error Cases

- **Missing aiohttp**: httpx_aiohttp provides clear error message
- **Version incompatibilities**: Standard pip dependency resolution
- **Runtime transport errors**: Handled by httpx_aiohttp → httpx error mapping
- **All other errors**: Existing SDK error handling unchanged

## Testing Strategy

### Test Coverage Areas

1. **Core Utility Tests**: Test aiohttp wrapper classes with/without dependencies
2. **Generator Tests**: Verify correct pyproject.toml generation and exports
3. **Seed Tests**: End-to-end validation using exhaustive fixture
4. **Manual Testing**: Install generated SDK with/without `[aiohttp]` extra

### Test Implementation

```python
# generators/python/tests/utils/test_http_client.py
def test_default_aiohttp_client_without_dependency():
    """Test error when httpx_aiohttp not installed"""
    with patch.dict('sys.modules', {'httpx_aiohttp': None}):
        with pytest.raises(RuntimeError, match="pip install.*\\[aiohttp\\]"):
            DefaultAioHttpClient()

def test_default_aiohttp_client_with_dependency():
    """Test successful instantiation with httpx_aiohttp"""
    client = DefaultAioHttpClient()
    assert isinstance(client, httpx.AsyncClient)
```

## Technical Considerations

### String Replacement Mechanism

- **Template**: `__FERN_SDK_PACKAGE__` in source files
- **Replacement**: Applied during `Project.add_source_file_from_disk()`
- **Source**: `custom_config.package_name` or module path fallback

### Dependency Constraints

- **httpx_aiohttp**: `>=0.1.9` (matches OpenAI/Anthropic)
- **aiohttp**: No explicit constraint (httpx_aiohttp decides compatibility)

### Type Safety

- **TYPE_CHECKING pattern**: Type checkers see `httpx.AsyncClient`, runtime gets wrapper/error class
- **No import failures**: Graceful handling regardless of installed packages

## Migration & Compatibility

### Backwards Compatibility

- ✅ All existing code continues unchanged
- ✅ No new required dependencies
- ✅ No changes to existing constructor signatures
- ✅ Same request/response types (httpx-compatible)

### Edge Cases

- **Streaming/SSE**: Works unchanged (httpx-aiohttp provides compatible interface)
- **Error handling/retries**: Works unchanged (aiohttp exceptions mapped to httpx)
- **Request construction**: Works unchanged (all httpx types maintained)

## Acceptance Criteria

1. ✅ Generated Python SDKs include `aiohttp` optional dependency in `pyproject.toml`
2. ✅ Generated SDKs export `DefaultAioHttpClient` from top-level package
3. ✅ Users can pass `httpx_client=DefaultAioHttpClient()` to async client constructors
4. ✅ Clear `RuntimeError` with install instructions when `httpx_aiohttp` not installed
5. ✅ All existing tests pass - purely additive change
6. ✅ Streaming, error handling, and retries work identically with both backends

## Implementation Phases

**Phase 1**: Core utility extension with aiohttp wrapper classes
**Phase 2**: PyProject.toml generation updates
**Phase 3**: Export management and string templating
**Phase 4**: Comprehensive testing (unit, generator, seed, manual)
**Phase 5**: Documentation updates

## References

- [httpx Discussion #3084: ConnectError with many async requests](https://github.com/encode/httpx/discussions/3084)
- [CPython Issue #112169: getaddrinfo DNS timeout](https://github.com/python/cpython/issues/112169)
- [OpenAI Python SDK (reference implementation)](https://github.com/openai/openai-python)
- [Anthropic Python SDK (reference implementation)](https://github.com/anthropics/anthropic-sdk-python)
- [httpx-aiohttp bridge package](https://github.com/karpetrosyan/httpx-aiohttp)
- [Original Cohere bug report](https://buildwithfern.slack.com/archives/C05KKD1P8BG/p1770850448173169)