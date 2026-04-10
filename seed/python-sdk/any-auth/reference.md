# Reference
## Auth
<details><summary><code>client.auth.<a href="src/seed/auth/client.py">gettoken</a>(...) -> TokenResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedApi

client = SeedApi(
    token="<token>",
    api_key="<X-API-Key>",
    base_url="https://yourhost.com/path/to/api",
)

client.auth.gettoken(
    client_id="client_id",
    client_secret="client_secret",
    audience="https://api.example.com",
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

**audience:** `AuthGetTokenRequestAudience` 
    
</dd>
</dl>

<dl>
<dd>

**grant_type:** `AuthGetTokenRequestGrantType` 
    
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

## User
<details><summary><code>client.user.<a href="src/seed/user/client.py">get</a>() -> typing.List[User]</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedApi

client = SeedApi(
    token="<token>",
    api_key="<X-API-Key>",
    base_url="https://yourhost.com/path/to/api",
)

client.user.get()

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

<details><summary><code>client.user.<a href="src/seed/user/client.py">getadmins</a>() -> typing.List[User]</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedApi

client = SeedApi(
    token="<token>",
    api_key="<X-API-Key>",
    base_url="https://yourhost.com/path/to/api",
)

client.user.getadmins()

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

