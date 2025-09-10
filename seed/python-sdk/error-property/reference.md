# Reference
## PropertyBasedError
<details><summary><code>client.property_based_error.<a href="src/seed/property_based_error/client.py">throw_error</a>()</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

GET request that always throws an error
</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedErrorProperty

client = SeedErrorProperty(
    base_url="https://yourhost.com/path/to/api",
)
client.property_based_error.throw_error()

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

