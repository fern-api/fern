# Reference
## Auth
<details><summary><code>client.auth.<a href="/src/api/resources/auth/client.rs">get_token_with_client_credentials</a>(request: GetTokenRequest) -> Result<TokenResponse, ApiError></code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```rust
use seed_websocket_auth::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        ..Default::default()
    };
    let client = WebsocketAuthClient::new(config).expect("Failed to build client");
    client
        .auth
        .get_token_with_client_credentials(
            &GetTokenRequest {
                x_api_key: "X-Api-Key".to_string(),
                client_id: "client_id".to_string(),
                client_secret: "client_secret".to_string(),
                audience: "https://api.example.com".to_string(),
                grant_type: "client_credentials".to_string(),
                scope: Some("scope".to_string()),
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

**client_id:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**client_secret:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**audience:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**grant_type:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**scope:** `Option<String>` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.auth.<a href="/src/api/resources/auth/client.rs">refresh_token</a>(request: RefreshTokenRequest) -> Result<TokenResponse, ApiError></code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```rust
use seed_websocket_auth::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        ..Default::default()
    };
    let client = WebsocketAuthClient::new(config).expect("Failed to build client");
    client
        .auth
        .refresh_token(
            &RefreshTokenRequest {
                x_api_key: "X-Api-Key".to_string(),
                client_id: "client_id".to_string(),
                client_secret: "client_secret".to_string(),
                refresh_token: "refresh_token".to_string(),
                audience: "https://api.example.com".to_string(),
                grant_type: "refresh_token".to_string(),
                scope: Some("scope".to_string()),
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

**client_id:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**client_secret:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**refresh_token:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**audience:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**grant_type:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**scope:** `Option<String>` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>
