@devin-ai-integration Please resolve this Dependabot security alert.

**Instructions:**
1. Analyze the vulnerability and understand its impact
2. Update the affected dependency to a secure version. If updating a poetry lock file, use the same version of poetry used to generate the existing one.
3. Ideally resolve this without using an override - prefer updating the dependency directly
4. If an override is absolutely necessary, document why in the PR description
5. Run tests to ensure the update doesn't break anything
6. Push your fix to this PR branch and tag @davidkonigsberg for review
7. Delete the scaffold file (.github/dependabot-alerts/alert-*.md) as part of your fix
8. Update the PR title, if needed, to pass CI checks

**Alert Details:**

- **Package:** langchain-core (pip)
- **Severity:** CRITICAL
- **Vulnerable versions:** < 0.3.81
- **Patched version:** 0.3.81
- **CVE:** CVE-2025-68664
- **GHSA:** GHSA-c67j-w6g6-q2cm
- **Manifest:** seed/python-sdk/exhaustive/extra_dependencies/poetry.lock

**Summary:**
LangChain serialization injection vulnerability enables secret extraction in dumps/loads APIs

**Description:**
## Summary

A serialization injection vulnerability exists in LangChain's `dumps()` and `dumpd()` functions. The functions do not escape dictionaries with `'lc'` keys when serializing free-form dictionaries. The `'lc'` key is used internally by LangChain to mark serialized objects. When user-controlled data contains this key structure, it is treated as a legitimate LangChain object during deserialization rather than plain user data.

### Attack surface

The core vulnerability was in `dumps()` and `dumpd()`: these functions failed to escape user-controlled dictionaries containing `'lc'` keys. When this unescaped data was later deserialized via `load()` or `loads()`, the injected structures were treated as legitimate LangChain objects rather than plain user data.

This escaping bug enabled several attack vectors:

1. **Injection via user data**: Malicious LangChain object structures could be injected through user-controlled fields like `metadata`, `additional_kwargs`, or `response_metadata`
2. **Class instantiation within trusted namespaces**: Injected manifests could instantiate any `Serializable` subclass, but only within the pre-approved trusted namespaces (`langchain_core`, `langchain`, `langchain_community`). This includes classes with side effects in `__init__` (network calls, file operations, etc.). Note that namespace validation was already enforced before this patch, so arbitrary classes outside these trusted namespaces could not be instantiated.

### Security hardening

This patch fixes the escaping bug in `dumps()` and `dumpd()` and introduces new restrictive defaults in `load()` and `loads()`: allowlist enforcement via `allowed_objects="core"` (restricted to [serialization mappings](https://github.com/langchain-ai/langchain/blob/master/libs/core/langchain_core/load/mapping.py)), `secrets_from_env` changed from `True` to `False`, and default Jinja2 template blocking via `init_validator`. These are breaking changes for some use cases.

## Who is affected?

Applications are vulnerable if they:

1. **Use `astream_events(version="v1")`** — The v1 implementation internally uses vulnerable serialization. Note: `astream_events(version="v2")` is not vulnerable.
2. **Use `Runnable.astream_log()`** — This method internally uses vulnerable serialization for streaming outputs.
3. **Call `dumps()` or `dumpd()` on untrusted data, then deserialize with `load()` or `loads()`** — Trusting your own serialization output makes you vulnerable if user-controlled data (e.g., from LLM responses, metadata fields, or user inputs) contains `'lc'` key structures.
4. **Deserialize untrusted data with `load()` or `loads()`** — Directly deserializing untrusted data that may contain injected `'lc'` structures.
5. **Use `RunnableWithMessageHistory`** — Internal serialization in message history handling.
6. **Use `InMemoryVectorStore.load()`** to deserialize untrusted documents.
7. Load untrusted generations from cache using **`langchain-community` caches**.
8. Load untrusted manifests from the LangChain Hub via **`hub.pull`**.
9. Use **`StringRunEvaluatorChain`** on untrusted runs.
10. Use **`create_lc_store`** or **`create_kv_docstore`** with untrusted documents.
11. Use **`MultiVectorRetriever`** with byte stores containing untrusted documents.
12. Use **`LangSmithRunChatLoader`** with runs containing untrusted messages.

The most common attack vector is through **LLM response fields** like `additional_kwargs` or `response_metadata`, which can be controlled via prompt injection and then serialized/deserialized in streaming operations.

## Impact

Attackers who control serialized data can extract environment variable secrets by injecting `{"lc": 1, "type": "secret", "id": ["ENV_VAR"]}` to load environment variables during deserialization (when `secrets_from_env=True`, which was the old default). They can also instantiate classes with controlled parameters by injecting constructor structures to instantiate any class within trusted namespaces with attacker-controlled parameters, potentially triggering side effects such as network calls or file operations.

Key severity factors:

- Affects the serialization path - applications trusting their own serialization output are vulnerable
- Enables secret extraction when combined with `secrets_from_env=True` (the old default)
- LLM responses in `additional_kwargs` can be controlled via prompt injection

## Exploit example

```python
from langchain_core.load import dumps, load
import os

# Attacker injects secret structure into user-controlled data
attacker_dict = {
    "user_data": {
        "lc": 1,
        "type": "secret",
        "id": ["OPENAI_API_KEY"]
    }
}

serialized = dumps(attacker_dict)  # Bug: does NOT escape the 'lc' key

os.environ["OPENAI_API_KEY"] = "sk-secret-key-12345"
deserialized = load(serialized, secrets_from_env=True)

print(deserialized["user_data"])  # "sk-secret-key-12345" - SECRET LEAKED!

```

## Security hardening changes (breaking changes)

This patch introduces three breaking changes to `load()` and `loads()`:

1. **New `allowed_objects` parameter** (defaults to `'core'`): Enforces allowlist of classes that can be deserialized. The `'all'` option corresponds to the list of objects [specified in `mappings.py`](https://github.com/langchain-ai/langchain/blob/master/libs/core/langchain_core/load/mapping.py) while the `'core'` option limits to objects within `langchain_core`. We recommend that users explicitly specify which objects they want to allow for serialization/deserialization.
2. **`secrets_from_env` default changed from `True` to `False`**: Disables automatic secret loading from environment
3. **New `init_validator` parameter** (defaults to `default_init_validator`): Blocks Jinja2 templates by default

## Migration guide

### No changes needed for most users

If you're deserializing standard LangChain types (messages, documents, prompts, trusted partner integrations like `ChatOpenAI`, `ChatAnthropic`, etc.), your code will work without changes:

```python
from langchain_core.load import load

# Uses default allowlist from serialization mappings
obj = load(serialized_data)

```

### For custom classes

If you're deserializing custom classes not in the serialization mappings, add them to the allowlist:

```python
from langchain_core.load import load
from my_package import MyCustomClass

# Specify the classes you need
obj = load(serialized_data, allowed_objects=[MyCustomClass])
```

### For Jinja2 templates

Jinja2 templates are now blocked by default because they can execute arbitrary code. If you need Jinja2 templates, pass `init_validator=None`:

```python
from langchain_core.load import load
from langchain_core.prompts import PromptTemplate

obj = load(
    serialized_data,
    allowed_objects=[PromptTemplate],
    init_validator=None
)

```

> [!WARNING]
> Only disable `init_validator` if you trust the serialized data. Jinja2 templates can execute arbitrary Python code.

### For secrets from environment

`secrets_from_env` now defaults to `False`. If you need to load secrets from environment variables:

```python
from langchain_core.load import load

obj = load(serialized_data, secrets_from_env=True)
```


## Credits

* Dumps bug was reported by @yardenporat
* Changes for security hardening due to findings from @0xn3va and @VladimirEliTokarev

---
[View Dependabot Alert](https://github.com/fern-api/fern/security/dependabot/807)
