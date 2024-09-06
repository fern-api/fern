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

client = SeedLiteral(
    base_url="https://yourhost.com/path/to/api",
)
client.inlined.send(
    temperature=10.1,
    context="You're super wise",
    maybe_context="You're super wise",
    object_with_literal={"nested_literal": {"my_literal": "How super cool"}},
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

**query:** `str` 
    
</dd>
</dl>

<dl>
<dd>

**object_with_literal:** `ATopLevelLiteralParams` 
    
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

client = SeedLiteral(
    base_url="https://yourhost.com/path/to/api",
)
client.reference.send(
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

**query:** `str` 
    
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

