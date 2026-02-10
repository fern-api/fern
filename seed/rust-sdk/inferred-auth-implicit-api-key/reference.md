# Reference
## Auth
<details><summary><code>client.auth.<a href="/src/api/resources/auth/client.rs">get_token</a>() -> Result&lt;TokenResponse, ApiError&gt;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```rust
use seed_inferred_auth_implicit_api_key::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        ..Default::default()
    };
    let client = InferredAuthImplicitApiKeyClient::new(config).expect("Failed to build client");
    client
        .auth
        .get_token(Some(
            RequestOptions::new().additional_header("X-Api-Key", "api_key"),
        ))
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

## NestedNoAuth Api
<details><summary><code>client.nested_no_auth().api.<a href="/src/api/resources/nested_no_auth/api/client.rs">get_something</a>() -> Result&lt;(), ApiError&gt;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```rust
use seed_inferred_auth_implicit_api_key::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        ..Default::default()
    };
    let client = InferredAuthImplicitApiKeyClient::new(config).expect("Failed to build client");
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
<details><summary><code>client.nested().api.<a href="/src/api/resources/nested/api/client.rs">get_something</a>() -> Result&lt;(), ApiError&gt;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```rust
use seed_inferred_auth_implicit_api_key::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        ..Default::default()
    };
    let client = InferredAuthImplicitApiKeyClient::new(config).expect("Failed to build client");
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
<details><summary><code>client.simple.<a href="/src/api/resources/simple/client.rs">get_something</a>() -> Result&lt;(), ApiError&gt;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```rust
use seed_inferred_auth_implicit_api_key::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        ..Default::default()
    };
    let client = InferredAuthImplicitApiKeyClient::new(config).expect("Failed to build client");
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
