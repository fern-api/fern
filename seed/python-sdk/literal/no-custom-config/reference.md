# Reference
## Headers
<details><summary><code>client.headers.<a href="src/seed/headers/client.py">send</a>(...)</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedLiteral

client = SeedLiteral(
    base_url="https://yourhost.com/path/to/api",
)
client.headers.send(
    query="What is the weather today",
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

**endpoint_version:** `typing.Literal["02-12-2024"]` 
    
</dd>
</dl>

<dl>
<dd>

**async_:** `typing.Literal[True]` 
    
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
<details><summary><code>client.inlined.<a href="src/seed/inlined/client.py">send</a>(...)</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedLiteral
from seed.inlined import ANestedLiteral, ATopLevelLiteral

client = SeedLiteral(
    base_url="https://yourhost.com/path/to/api",
)
client.inlined.send(
    temperature=10.1,
    context="You're super wise",
    maybe_context="You're super wise",
    object_with_literal=ATopLevelLiteral(
        nested_literal=ANestedLiteral(),
    ),
    query="What is the weather today",
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

**prompt:** `typing.Literal["You are a helpful assistant"]` 
    
</dd>
</dl>

<dl>
<dd>

**query:** `str` 
    
</dd>
</dl>

<dl>
<dd>

**stream:** `typing.Literal[False]` 
    
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

**context:** `typing.Optional[typing.Literal["You're super wise"]]` 
    
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
<details><summary><code>client.path.<a href="src/seed/path/client.py">send</a>()</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedLiteral

client = SeedLiteral(
    base_url="https://yourhost.com/path/to/api",
)
client.path.send()

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

**request_options:** `typing.Optional[RequestOptions]` — Request-specific configuration.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## Query
<details><summary><code>client.query.<a href="src/seed/query/client.py">send</a>(...)</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedLiteral

client = SeedLiteral(
    base_url="https://yourhost.com/path/to/api",
)
client.query.send(
    query="What is the weather today",
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

**prompt:** `typing.Literal["You are a helpful assistant"]` 
    
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

**stream:** `typing.Literal[False]` 
    
</dd>
</dl>

<dl>
<dd>

**alias_stream:** `AliasToStream` 
    
</dd>
</dl>

<dl>
<dd>

**optional_prompt:** `typing.Optional[typing.Literal["You are a helpful assistant"]]` 
    
</dd>
</dl>

<dl>
<dd>

**alias_optional_prompt:** `typing.Optional[AliasToPrompt]` 
    
</dd>
</dl>

<dl>
<dd>

**optional_stream:** `typing.Optional[typing.Literal[False]]` 
    
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
<details><summary><code>client.reference.<a href="src/seed/reference/client.py">send</a>(...)</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedLiteral
from seed.reference import ContainerObject, NestedObjectWithLiterals

client = SeedLiteral(
    base_url="https://yourhost.com/path/to/api",
)
client.reference.send(
    query="What is the weather today",
    container_object=ContainerObject(
        nested_objects=[
            NestedObjectWithLiterals(
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

**prompt:** `typing.Literal["You are a helpful assistant"]` 
    
</dd>
</dl>

<dl>
<dd>

**query:** `str` 
    
</dd>
</dl>

<dl>
<dd>

**stream:** `typing.Literal[False]` 
    
</dd>
</dl>

<dl>
<dd>

**ending:** `typing.Literal["$ending"]` 
    
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

