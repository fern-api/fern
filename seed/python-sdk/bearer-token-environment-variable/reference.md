# Reference
## Service
<details><summary><code>client.service.<a href="src/seed/service/client.py">get_with_bearer_token</a>()</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

GET request with custom api key
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
from seed import SeedBearerTokenEnvironmentVariable

client = SeedBearerTokenEnvironmentVariable(
    api_key="YOUR_API_KEY",
    base_url="https://yourhost.com/path/to/api",
)
client.service.get_with_bearer_token()

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

