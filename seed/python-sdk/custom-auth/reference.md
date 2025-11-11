# Reference
## CustomAuth
<details><summary><code>client.custom_auth.<a href="src/seed/custom_auth/client.py">get_with_custom_auth</a>()</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

GET request with custom auth scheme
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
from seed import SeedCustomAuth

client = SeedCustomAuth(
    custom_auth_scheme="YOUR_CUSTOM_AUTH_SCHEME",
    base_url="https://yourhost.com/path/to/api",
)
client.custom_auth.get_with_custom_auth()

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

<details><summary><code>client.custom_auth.<a href="src/seed/custom_auth/client.py">post_with_custom_auth</a>(...)</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

POST request with custom auth scheme
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
from seed import SeedCustomAuth

client = SeedCustomAuth(
    custom_auth_scheme="YOUR_CUSTOM_AUTH_SCHEME",
    base_url="https://yourhost.com/path/to/api",
)
client.custom_auth.post_with_custom_auth(
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

