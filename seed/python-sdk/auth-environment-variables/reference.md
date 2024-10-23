# Reference
## Service
<details><summary><code>client.service.<a href="src/seed/service/client.py">get_with_api_key</a>()</code></summary>
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
from seed import SeedAuthEnvironmentVariables

client = SeedAuthEnvironmentVariables(
    x_another_header="YOUR_X_ANOTHER_HEADER",
    api_key="YOUR_API_KEY",
    base_url="https://yourhost.com/path/to/api",
)
client.service.get_with_api_key()

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

<details><summary><code>client.service.<a href="src/seed/service/client.py">get_with_header</a>(...)</code></summary>
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
from seed import SeedAuthEnvironmentVariables

client = SeedAuthEnvironmentVariables(
    x_another_header="YOUR_X_ANOTHER_HEADER",
    api_key="YOUR_API_KEY",
    base_url="https://yourhost.com/path/to/api",
)
client.service.get_with_header(
    x_endpoint_header="X-Endpoint-Header",
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

**x_endpoint_header:** `typing.Optional[str]` — Specifies the endpoint key.
    
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

