# Reference
## Auth
<details><summary><code>client.auth.<a href="src/seed/auth/client.py">get_token_with_client_credentials</a>(...) -&gt; AsyncHttpResponse[TokenResponse]</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedOauthClientCredentialsMandatoryAuth

client = SeedOauthClientCredentialsMandatoryAuth(
    base_url="https://yourhost.com/path/to/api",
    client_id="YOUR_CLIENT_ID",
    client_secret="YOUR_CLIENT_SECRET",
)
client.auth.get_token_with_client_credentials(
    client_id="my_oauth_app_123",
    client_secret="sk_live_abcdef123456789",
    scope="read:users",
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

<details><summary><code>client.auth.<a href="src/seed/auth/client.py">refresh_token</a>(...) -&gt; AsyncHttpResponse[TokenResponse]</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedOauthClientCredentialsMandatoryAuth

client = SeedOauthClientCredentialsMandatoryAuth(
    base_url="https://yourhost.com/path/to/api",
    client_id="YOUR_CLIENT_ID",
    client_secret="YOUR_CLIENT_SECRET",
)
client.auth.refresh_token(
    client_id="my_oauth_app_123",
    client_secret="sk_live_abcdef123456789",
    refresh_token="refresh_token",
    scope="read:users",
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

**refresh_token:** `str` 
    
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

## Nested Api
<details><summary><code>client.nested.api.<a href="src/seed/nested/api/client.py">get_something</a>() -&gt; AsyncHttpResponse[None]</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedOauthClientCredentialsMandatoryAuth

client = SeedOauthClientCredentialsMandatoryAuth(
    base_url="https://yourhost.com/path/to/api",
    client_id="YOUR_CLIENT_ID",
    client_secret="YOUR_CLIENT_SECRET",
)
client.nested.api.get_something()

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

## Simple
<details><summary><code>client.simple.<a href="src/seed/simple/client.py">get_something</a>() -&gt; AsyncHttpResponse[None]</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedOauthClientCredentialsMandatoryAuth

client = SeedOauthClientCredentialsMandatoryAuth(
    base_url="https://yourhost.com/path/to/api",
    client_id="YOUR_CLIENT_ID",
    client_secret="YOUR_CLIENT_SECRET",
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

