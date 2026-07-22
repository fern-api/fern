# Reference
## Auth
<details><summary><code>client.auth.<a href="/src/api/resources/auth/client.rs">get_token</a>(request: GetTokenAuthRequest, audience: Option&lt;Option&lt;GetTokenAuthRequestAudience&gt;&gt;) -> Result&lt;TokenResponse, ApiError&gt;</code></summary>
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
        ..Default::default()
    };
    let client = ApiClient::new(config).expect("Failed to build client");
    client
        .auth
        .get_token(
            &GetTokenAuthRequest {
                client_id: "client_id".to_string(),
                client_secret: "client_secret".to_string(),
                scopes: "scopes".to_string(),
                grant_type: GetTokenAuthRequestGrantType::ClientCredentials,
                tenant: "tenant".to_string(),
                audience: None,
                optional_hint: None,
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

**scopes:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**grant_type:** `GetTokenAuthRequestGrantType` 
    
</dd>
</dl>

<dl>
<dd>

**tenant:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**optional_hint:** `Option<String>` 
    
</dd>
</dl>

<dl>
<dd>

**audience:** `Option<GetTokenAuthRequestAudience>` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.auth.<a href="/src/api/resources/auth/client.rs">refresh_token</a>(request: RefreshTokenAuthRequest) -> Result&lt;TokenResponse, ApiError&gt;</code></summary>
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
        ..Default::default()
    };
    let client = ApiClient::new(config).expect("Failed to build client");
    client
        .auth
        .refresh_token(
            &RefreshTokenAuthRequest {
                refresh_token: "refresh_token".to_string(),
                grant_type: RefreshTokenAuthRequestGrantType::RefreshToken,
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

**refresh_token:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**grant_type:** `RefreshTokenAuthRequestGrantType` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## System
<details><summary><code>client.system.<a href="/src/api/resources/system/client.rs">health</a>() -> Result&lt;(), ApiError&gt;</code></summary>
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
        ..Default::default()
    };
    let client = ApiClient::new(config).expect("Failed to build client");
    client.system.health(None).await;
}
```
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## Pets
<details><summary><code>client.pets.<a href="/src/api/resources/pets/client.rs">list</a>() -> Result&lt;Vec&lt;String&gt;, ApiError&gt;</code></summary>
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
        ..Default::default()
    };
    let client = ApiClient::new(config).expect("Failed to build client");
    client.pets.list(None).await;
}
```
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

