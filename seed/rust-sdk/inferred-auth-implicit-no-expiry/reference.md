# Reference
## Auth
<details><summary><code>client.auth.<a href="/src/api/resources/auth/client.rs">gettokenwithclientcredentials</a>(request: AuthGetTokenWithClientCredentialsRequest) -> Result&lt;TokenResponse, ApiError&gt;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```rust
use seed_api::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        token: Some("<token>".to_string()),
        ..Default::default()
    };
    let client = ApiClient::new(config).expect("Failed to build client");
    client
        .auth
        .gettokenwithclientcredentials(
            &AuthGetTokenWithClientCredentialsRequest {
                client_id: "client_id".to_string(),
                client_secret: "client_secret".to_string(),
                audience: AuthGetTokenWithClientCredentialsRequestAudience::HttpsApiExampleCom,
                grant_type: AuthGetTokenWithClientCredentialsRequestGrantType::ClientCredentials,
                scope: None,
            },
            Some(RequestOptions::new().additional_header("X-Api-Key", "X-Api-Key")),
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

**audience:** `AuthGetTokenWithClientCredentialsRequestAudience` 
    
</dd>
</dl>

<dl>
<dd>

**grant_type:** `AuthGetTokenWithClientCredentialsRequestGrantType` 
    
</dd>
</dl>

<dl>
<dd>

**scope:** `Option<Option<String>>` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.auth.<a href="/src/api/resources/auth/client.rs">refreshtoken</a>(request: AuthRefreshTokenRequest) -> Result&lt;TokenResponse, ApiError&gt;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```rust
use seed_api::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        token: Some("<token>".to_string()),
        ..Default::default()
    };
    let client = ApiClient::new(config).expect("Failed to build client");
    client
        .auth
        .refreshtoken(
            &AuthRefreshTokenRequest {
                client_id: "client_id".to_string(),
                client_secret: "client_secret".to_string(),
                refresh_token: "refresh_token".to_string(),
                audience: AuthRefreshTokenRequestAudience::HttpsApiExampleCom,
                grant_type: AuthRefreshTokenRequestGrantType::RefreshToken,
                scope: None,
            },
            Some(RequestOptions::new().additional_header("X-Api-Key", "X-Api-Key")),
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

**audience:** `AuthRefreshTokenRequestAudience` 
    
</dd>
</dl>

<dl>
<dd>

**grant_type:** `AuthRefreshTokenRequestGrantType` 
    
</dd>
</dl>

<dl>
<dd>

**scope:** `Option<Option<String>>` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## NestedNoAuthApi
<details><summary><code>client.nested_no_auth_api.<a href="/src/api/resources/nested_no_auth_api/client.rs">nested_no_auth_api_get_something</a>() -> Result&lt;(), ApiError&gt;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```rust
use seed_api::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        token: Some("<token>".to_string()),
        ..Default::default()
    };
    let client = ApiClient::new(config).expect("Failed to build client");
    client
        .nested_no_auth_api
        .nested_no_auth_api_get_something(None)
        .await;
}
```
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## NestedApi
<details><summary><code>client.nested_api.<a href="/src/api/resources/nested_api/client.rs">nested_api_get_something</a>() -> Result&lt;(), ApiError&gt;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```rust
use seed_api::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        token: Some("<token>".to_string()),
        ..Default::default()
    };
    let client = ApiClient::new(config).expect("Failed to build client");
    client.nested_api.nested_api_get_something(None).await;
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
<details><summary><code>client.simple.<a href="/src/api/resources/simple/client.rs">getsomething</a>() -> Result&lt;(), ApiError&gt;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```rust
use seed_api::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        token: Some("<token>".to_string()),
        ..Default::default()
    };
    let client = ApiClient::new(config).expect("Failed to build client");
    client.simple.getsomething(None).await;
}
```
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

