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
use seed_oauth_client_credentials_default::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        ..Default::default()
    };
    let client = OauthClientCredentialsDefaultClient::new(config).expect("Failed to build client");
    client
        .auth
        .get_token(
            &GetTokenRequest {
                client_id: "client_id".to_string(),
                client_secret: "client_secret".to_string(),
                grant_type: "client_credentials".to_string(),
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

**grant_type:** `String` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## NestedNoAuth Api
<details><summary><code>client.nested_no_auth().api.<a href="/src/api/resources/nested_no_auth/api/client.rs">get_something</a>() -> Result<(), ApiError></code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```rust
use seed_oauth_client_credentials_default::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        ..Default::default()
    };
    let client = OauthClientCredentialsDefaultClient::new(config).expect("Failed to build client");
    client.nested_no_auth.api.get_something(None).await;
}
```
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## Nested Api
<details><summary><code>client.nested().api.<a href="/src/api/resources/nested/api/client.rs">get_something</a>() -> Result<(), ApiError></code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```rust
use seed_oauth_client_credentials_default::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        ..Default::default()
    };
    let client = OauthClientCredentialsDefaultClient::new(config).expect("Failed to build client");
    client.nested.api.get_something(None).await;
}
```
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## Simple
<details><summary><code>client.simple.<a href="/src/api/resources/simple/client.rs">get_something</a>() -> Result<(), ApiError></code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```rust
use seed_oauth_client_credentials_default::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        ..Default::default()
    };
    let client = OauthClientCredentialsDefaultClient::new(config).expect("Failed to build client");
    client.simple.get_something(None).await;
}
```
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>
