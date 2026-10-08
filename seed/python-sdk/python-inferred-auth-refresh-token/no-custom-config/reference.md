# Reference
## Auth
<details><summary><code>client.auth.<a href="src/seed/auth/client.py">get_token_with_refresh_token</a>(...) -> TokenResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedPythonInferredAuthRefreshToken

client = SeedPythonInferredAuthRefreshToken(
    refresh_token="refresh_token",
    scope="scope",
    base_url="https://yourhost.com/path/to/api",
)

client.auth.get_token_with_refresh_token(
    refresh_token="my-refresh-token",
    grant_type="refresh_token",
    scope="read",
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

**refresh_token:** `str` 
    
</dd>
</dl>

<dl>
<dd>

**grant_type:** `str` 
    
</dd>
</dl>

<dl>
<dd>

**scope:** `typing.Optional[str]` 
    
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

## Simple
<details><summary><code>client.simple.<a href="src/seed/simple/client.py">get_something</a>()</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedPythonInferredAuthRefreshToken

client = SeedPythonInferredAuthRefreshToken(
    refresh_token="refresh_token",
    scope="scope",
    base_url="https://yourhost.com/path/to/api",
)

client.simple.get_something()

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

