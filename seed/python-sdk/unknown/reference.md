# Reference
## Unknown
<details><summary><code>client.unknown.<a href="src/seed/unknown/client.py">post</a>(...) -> typing.List[typing.Any]</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedUnknownAsAny

client = SeedUnknownAsAny(
    base_url="https://yourhost.com/path/to/api",
)

client.unknown.post(
    request={"key": "value"},
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

**request:** `typing.Any` 
    
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

<details><summary><code>client.unknown.<a href="src/seed/unknown/client.py">post_object</a>(...) -> typing.List[typing.Any]</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedUnknownAsAny

client = SeedUnknownAsAny(
    base_url="https://yourhost.com/path/to/api",
)

client.unknown.post_object(
    unknown={"key": "value"},
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

**request:** `MyObject` 
    
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

