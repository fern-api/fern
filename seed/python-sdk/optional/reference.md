# Reference
## Optional
<details><summary><code>client.optional.<a href="src/seed/optional/client.py">send_optional_body</a>(...)</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedObjectsWithImports

client = SeedObjectsWithImports(
    base_url="https://yourhost.com/path/to/api",
)
client.optional.send_optional_body(
    request={"string": {"key": "value"}},
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

**request:** `typing.Optional[typing.Dict[str, typing.Optional[typing.Any]]]` 
    
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

<details><summary><code>client.optional.<a href="src/seed/optional/client.py">send_optional_typed_body</a>(...)</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedObjectsWithImports
from seed.optional import SendOptionalBodyRequest

client = SeedObjectsWithImports(
    base_url="https://yourhost.com/path/to/api",
)
client.optional.send_optional_typed_body(
    request=SendOptionalBodyRequest(
        message="message",
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

**request:** `typing.Optional[SendOptionalBodyRequest]` 
    
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

