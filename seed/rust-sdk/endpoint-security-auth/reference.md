# Reference
## Auth
<details><summary><code>client.auth.<a href="/src/api/resources/auth/client.rs">get_token</a>(request: GetTokenRequest) -> Result<TokenResponse, ApiError></code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```rust
use seed_endpoint_security_auth::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        token: Some("<token>".to_string()),
        ..Default::default()
    };
    let client = EndpointSecurityAuthClient::new(config).expect("Failed to build client");
    client
        .auth
        .get_token(
            &GetTokenRequest {
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

## User
<details><summary><code>client.user.<a href="/src/api/resources/user/client.rs">get_with_bearer</a>() -> Result<Vec<User>, ApiError></code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```rust
use seed_endpoint_security_auth::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        token: Some("<token>".to_string()),
        ..Default::default()
    };
    let client = EndpointSecurityAuthClient::new(config).expect("Failed to build client");
    client.user.get_with_bearer(None).await;
}
```
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.user.<a href="/src/api/resources/user/client.rs">get_with_api_key</a>() -> Result<Vec<User>, ApiError></code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```rust
use seed_endpoint_security_auth::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        token: Some("<token>".to_string()),
        ..Default::default()
    };
    let client = EndpointSecurityAuthClient::new(config).expect("Failed to build client");
    client.user.get_with_bearer(None).await;
}
```
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.user.<a href="/src/api/resources/user/client.rs">get_with_o_auth</a>() -> Result<Vec<User>, ApiError></code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```rust
use seed_endpoint_security_auth::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        token: Some("<token>".to_string()),
        ..Default::default()
    };
    let client = EndpointSecurityAuthClient::new(config).expect("Failed to build client");
    client.user.get_with_bearer(None).await;
}
```
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.user.<a href="/src/api/resources/user/client.rs">get_with_any_auth</a>() -> Result<Vec<User>, ApiError></code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```rust
use seed_endpoint_security_auth::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        token: Some("<token>".to_string()),
        ..Default::default()
    };
    let client = EndpointSecurityAuthClient::new(config).expect("Failed to build client");
    client.user.get_with_bearer(None).await;
}
```
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.user.<a href="/src/api/resources/user/client.rs">get_with_all_auth</a>() -> Result<Vec<User>, ApiError></code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```rust
use seed_endpoint_security_auth::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        token: Some("<token>".to_string()),
        ..Default::default()
    };
    let client = EndpointSecurityAuthClient::new(config).expect("Failed to build client");
    client.user.get_with_bearer(None).await;
}
```
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>
