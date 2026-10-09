# Reference
## Oauth
<details><summary><code>client.oauth.<a href="/src/api/resources/oauth/client.rs">authorize</a>(response_type: Option&lt;String&gt;, client_id: Option&lt;String&gt;, redirect_uri: Option&lt;String&gt;, code_challenge: Option&lt;String&gt;, code_challenge_method: Option&lt;Option&lt;String&gt;&gt;, scope: Option&lt;Option&lt;String&gt;&gt;, state: Option&lt;Option&lt;String&gt;&gt;) -> Result&lt;AuthorizeResponse, ApiError&gt;</code></summary>
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

```rust
use seed_oauth_pkce::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        ..Default::default()
    };
    let client = OauthPkceClient::new(config).expect("Failed to build client");
    client
        .oauth
        .authorize(
            &AuthorizeQueryRequest {
                response_type: "code".to_string(),
                client_id: "client_abc123".to_string(),
                redirect_uri: "https://example.com/callback".to_string(),
                code_challenge: "E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM".to_string(),
                code_challenge_method: Some("S256".to_string()),
                scope: Some("read write".to_string()),
                state: Some("xyz".to_string()),
            },
            None,
        )
        .await;
}
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

**response_type:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**client_id:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**redirect_uri:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**code_challenge:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**code_challenge_method:** `Option<String>` 
    
</dd>
</dl>

<dl>
<dd>

**scope:** `Option<String>` 
    
</dd>
</dl>

<dl>
<dd>

**state:** `Option<String>` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

