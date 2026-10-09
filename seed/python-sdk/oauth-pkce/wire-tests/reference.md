# Reference
## Oauth
<details><summary><code>client.oauth.<a href="src/seed/oauth/client.py">authorize</a>(...) -> AuthorizeResponse</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Authorization-code grant with PKCE. `response_type` is a required literal that is
hardcoded by the generated method; `code_challenge_method` is an optional literal
that must still be sent on the wire when provided.
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
from seed import SeedOauthPkce

client = SeedOauthPkce(
    base_url="https://yourhost.com/path/to/api",
)

client.oauth.authorize(
    client_id="client_abc123",
    redirect_uri="https://example.com/callback",
    code_challenge="E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM",
    code_challenge_method="S256",
    scope="read write",
    state="xyz",
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

**response_type:** `typing.Literal` 
    
</dd>
</dl>

<dl>
<dd>

**client_id:** `str` 
    
</dd>
</dl>

<dl>
<dd>

**redirect_uri:** `str` 
    
</dd>
</dl>

<dl>
<dd>

**code_challenge:** `str` 
    
</dd>
</dl>

<dl>
<dd>

**code_challenge_method:** `typing.Optional[typing.Literal]` 
    
</dd>
</dl>

<dl>
<dd>

**scope:** `typing.Optional[str]` 
    
</dd>
</dl>

<dl>
<dd>

**state:** `typing.Optional[str]` 
    
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

