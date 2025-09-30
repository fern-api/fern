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
use seed_oauth_client_credentials_with_variables::{
    ClientConfig, GetTokenRequest, OauthClientCredentialsWithVariablesClient,
};
use std::collections::HashMap;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        ..Default::default()
    };
    let client =
        OauthClientCredentialsWithVariablesClient::new(config).expect("Failed to build client");
    client
        .auth
        .get_token_with_client_credentials(
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

<details><summary><code>client.auth.<a href="/src/api/resources/auth/client.rs">refresh_token</a>(request: RefreshTokenRequest) -> Result<TokenResponse, ApiError></code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```rust
use seed_oauth_client_credentials_with_variables::{
    ClientConfig, OauthClientCredentialsWithVariablesClient, RefreshTokenRequest,
};
use std::collections::HashMap;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        ..Default::default()
    };
    let client =
        OauthClientCredentialsWithVariablesClient::new(config).expect("Failed to build client");
    client
        .auth
        .refresh_token(
            &RefreshTokenRequest {
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
use seed_oauth_client_credentials_with_variables::{
    ClientConfig, OauthClientCredentialsWithVariablesClient,
};

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        ..Default::default()
    };
    let client =
        OauthClientCredentialsWithVariablesClient::new(config).expect("Failed to build client");
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
use seed_oauth_client_credentials_with_variables::{
    ClientConfig, OauthClientCredentialsWithVariablesClient,
};

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        ..Default::default()
    };
    let client =
        OauthClientCredentialsWithVariablesClient::new(config).expect("Failed to build client");
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

## Service
<details><summary><code>client.service.<a href="/src/api/resources/service/client.rs">post</a>(endpoint_param: String) -> Result<(), ApiError></code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```rust
use seed_oauth_client_credentials_with_variables::{
    ClientConfig, OauthClientCredentialsWithVariablesClient,
};

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        ..Default::default()
    };
    let client =
        OauthClientCredentialsWithVariablesClient::new(config).expect("Failed to build client");
    client.service.post(None).await;
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

**endpoint_param:** `String` 
    
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
use seed_oauth_client_credentials_with_variables::{
    ClientConfig, OauthClientCredentialsWithVariablesClient,
};

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        ..Default::default()
    };
    let client =
        OauthClientCredentialsWithVariablesClient::new(config).expect("Failed to build client");
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
