# Reference
## Auth
<details><summary><code>client.auth.<a href="src/seed/auth/client.py">create_oauth2_token</a>(...) -> TokenResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedPythonOauthTokenOptional

client = SeedPythonOauthTokenOptional(
    client_id="<clientId>",
    client_secret="<clientSecret>",
    base_url="https://yourhost.com/path/to/api",
)

client.auth.create_oauth2_token(
    client_id="my_oauth_app_123",
    client_secret="sk_live_abcdef123456789",
    grant_type="client_credentials",
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

**client_id:** `str` 
    
</dd>
</dl>

<dl>
<dd>

**client_secret:** `str` 
    
</dd>
</dl>

<dl>
<dd>

**grant_type:** `typing.Optional[str]` 
    
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

