# Reference
## BasicAuth
<details><summary><code>client.basic_auth.<a href="src/seed/basic_auth/client.py">get_with_basic_auth</a>()</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

GET request with basic auth scheme
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
from seed import SeedBasicAuthEnvironmentVariables

client = SeedBasicAuthEnvironmentVariables(
    username="YOUR_USERNAME",
    access_token="YOUR_ACCESS_TOKEN",
    base_url="https://yourhost.com/path/to/api",
)
client.basic_auth.get_with_basic_auth()

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

<details><summary><code>client.basic_auth.<a href="src/seed/basic_auth/client.py">post_with_basic_auth</a>(...)</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

POST request with basic auth scheme
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
from seed import SeedBasicAuthEnvironmentVariables

client = SeedBasicAuthEnvironmentVariables(
    username="YOUR_USERNAME",
    access_token="YOUR_ACCESS_TOKEN",
    base_url="https://yourhost.com/path/to/api",
)
client.basic_auth.post_with_basic_auth(
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

**request:** `typing.Optional[typing.Any]` 
    
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

