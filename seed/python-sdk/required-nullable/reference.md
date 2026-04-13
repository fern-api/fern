# Reference
## _
<details><summary><code>client._.<a href="src/seed/_/client.py">get_foo</a>(...) -> Foo</code></summary>
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

client._.get_foo(
    required_baz="required_baz",
    required_nullable_baz="required_nullable_baz",
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

**required_baz:** `str` — A required baz
    
</dd>
</dl>

<dl>
<dd>

**optional_baz:** `typing.Optional[str]` — An optional baz
    
</dd>
</dl>

<dl>
<dd>

**optional_nullable_baz:** `typing.Optional[str]` — An optional baz
    
</dd>
</dl>

<dl>
<dd>

**required_nullable_baz:** `typing.Optional[str]` — A required baz
    
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

<details><summary><code>client._.<a href="src/seed/_/client.py">update_foo</a>(...) -> Foo</code></summary>
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

client._.update_foo(
    id="id",
    idempotency_key="X-Idempotency-Key",
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

**id:** `str` 
    
</dd>
</dl>

<dl>
<dd>

**idempotency_key:** `str` 
    
</dd>
</dl>

<dl>
<dd>

**nullable_text:** `typing.Optional[str]` — Can be explicitly set to null to clear the value
    
</dd>
</dl>

<dl>
<dd>

**nullable_number:** `typing.Optional[float]` — Can be explicitly set to null to clear the value
    
</dd>
</dl>

<dl>
<dd>

**non_nullable_text:** `typing.Optional[str]` — Regular non-nullable field
    
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

