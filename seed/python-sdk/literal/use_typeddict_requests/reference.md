# Reference
## Headers
<details><summary><code>client.headers.<a href="src/seed/headers/client.py">send</a>(...) -> SendResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedApi

client = SeedApi(
    base_url="https://yourhost.com/path/to/api",
)

client.headers.send(
    endpoint_version="02-12-2024",
    async_=True,
    query="query",
)

```
</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**endpoint_version:** `HeadersSendRequestXEndpointVersion` 
    
</dd>
</dl>

<dl>
<dd>

**async:** `bool` 
    
</dd>
</dl>

<dl>
<dd>

**query:** `str` 
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `typing.Optional[RequestOptions]` — Request-specific configuration.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## Inlined
<details><summary><code>client.inlined.<a href="src/seed/inlined/client.py">send</a>(...) -> SendResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedApi, ATopLevelLiteral, ANestedLiteral

client = SeedApi(
    base_url="https://yourhost.com/path/to/api",
)

client.inlined.send(
    prompt="You are a helpful assistant",
    query="query",
    stream=True,
    aliased_context="You\'re super wise",
    object_with_literal=ATopLevelLiteral(
        nested_literal=ANestedLiteral(
            my_literal="How super cool",
        ),
    ),
)

```
</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**prompt:** `InlinedSendRequestPrompt` 
    
</dd>
</dl>

<dl>
<dd>

**query:** `str` 
    
</dd>
</dl>

<dl>
<dd>

**stream:** `bool` 
    
</dd>
</dl>

<dl>
<dd>

**aliased_context:** `SomeAliasedLiteral` 
    
</dd>
</dl>

<dl>
<dd>

**object_with_literal:** `ATopLevelLiteral` 
    
</dd>
</dl>

<dl>
<dd>

**context:** `typing.Optional[InlinedSendRequestContext]` 
    
</dd>
</dl>

<dl>
<dd>

**temperature:** `typing.Optional[float]` 
    
</dd>
</dl>

<dl>
<dd>

**maybe_context:** `typing.Optional[SomeAliasedLiteral]` 
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `typing.Optional[RequestOptions]` — Request-specific configuration.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## Path
<details><summary><code>client.path.<a href="src/seed/path/client.py">send</a>(...) -> SendResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedApi

client = SeedApi(
    base_url="https://yourhost.com/path/to/api",
)

client.path.send(
    id="123",
)

```
</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**id:** `PathSendRequestId` 
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `typing.Optional[RequestOptions]` — Request-specific configuration.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## Query
<details><summary><code>client.query.<a href="src/seed/query/client.py">send</a>(...) -> SendResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedApi

client = SeedApi(
    base_url="https://yourhost.com/path/to/api",
)

client.query.send(
    prompt="You are a helpful assistant",
    alias_prompt="You are a helpful assistant",
    query="query",
    stream=True,
    alias_stream=True,
)

```
</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**prompt:** `QuerySendRequestPrompt` 
    
</dd>
</dl>

<dl>
<dd>

**alias_prompt:** `AliasToPrompt` 
    
</dd>
</dl>

<dl>
<dd>

**query:** `str` 
    
</dd>
</dl>

<dl>
<dd>

**stream:** `bool` 
    
</dd>
</dl>

<dl>
<dd>

**alias_stream:** `AliasToStream` 
    
</dd>
</dl>

<dl>
<dd>

**optional_prompt:** `typing.Optional[QuerySendRequestOptionalPrompt]` 
    
</dd>
</dl>

<dl>
<dd>

**alias_optional_prompt:** `typing.Optional[AliasToPrompt]` 
    
</dd>
</dl>

<dl>
<dd>

**optional_stream:** `typing.Optional[bool]` 
    
</dd>
</dl>

<dl>
<dd>

**alias_optional_stream:** `typing.Optional[AliasToStream]` 
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `typing.Optional[RequestOptions]` — Request-specific configuration.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## Reference
<details><summary><code>client.reference.<a href="src/seed/reference/client.py">send</a>(...) -> SendResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedApi, ContainerObject, NestedObjectWithLiterals

client = SeedApi(
    base_url="https://yourhost.com/path/to/api",
)

client.reference.send(
    prompt="You are a helpful assistant",
    query="query",
    stream=True,
    ending="$ending",
    context="You\'re super wise",
    container_object=ContainerObject(
        nested_objects=[
            NestedObjectWithLiterals(
                literal1="literal1",
                literal2="literal2",
                str_prop="strProp",
            )
        ],
    ),
)

```
</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**prompt:** `SendRequestPrompt` 
    
</dd>
</dl>

<dl>
<dd>

**query:** `str` 
    
</dd>
</dl>

<dl>
<dd>

**stream:** `bool` 
    
</dd>
</dl>

<dl>
<dd>

**ending:** `SendRequestEnding` 
    
</dd>
</dl>

<dl>
<dd>

**context:** `SomeLiteral` 
    
</dd>
</dl>

<dl>
<dd>

**container_object:** `ContainerObject` 
    
</dd>
</dl>

<dl>
<dd>

**maybe_context:** `typing.Optional[SomeLiteral]` 
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `typing.Optional[RequestOptions]` — Request-specific configuration.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

