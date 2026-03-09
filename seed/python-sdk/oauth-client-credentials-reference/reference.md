# Reference
## Auth
<details><summary><code>client.auth.<a href="src/seed/auth/client.py">get_token</a>(...) -> TokenResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedOauthClientCredentialsReference

client = SeedOauthClientCredentialsReference(
    client_id="<clientId>",
    client_secret="<clientSecret>",
    base_url="https://yourhost.com/path/to/api",
)

client.auth.get_token(
    client_id="client_id",
    client_secret="client_secret",
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

**request:** `GetTokenRequest` 
    
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
from seed import SeedOauthClientCredentialsReference

client = SeedOauthClientCredentialsReference(
    client_id="<clientId>",
    client_secret="<clientSecret>",
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

