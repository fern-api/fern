# Reference
<details><summary><code>client.<a href="/src/client.rs">get_users</a>() -> Result&lt;Vec&lt;User&gt;, ApiError&gt;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```rust
use server_url_templating_api_sdk::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        ..Default::default()
    };
    let client = ServerUrlTemplatingApiClient::new(config).expect("Failed to build client");
    client.get_users(None).await;
}
```
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.<a href="/src/client.rs">get_user</a>(user_id: String) -> Result&lt;User, ApiError&gt;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```rust
use server_url_templating_api_sdk::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        ..Default::default()
    };
    let client = ServerUrlTemplatingApiClient::new(config).expect("Failed to build client");
    client.get_user(&"userId".to_string(), None).await;
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

**user_id:** `String` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.<a href="/src/client.rs">get_token</a>(request: TokenRequest) -> Result&lt;TokenResponse, ApiError&gt;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```rust
use server_url_templating_api_sdk::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        ..Default::default()
    };
    let client = ServerUrlTemplatingApiClient::new(config).expect("Failed to build client");
    client
        .get_token(
            &TokenRequest {
                client_id: "client_id".to_string(),
                client_secret: "client_secret".to_string(),
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
</dd>
</dl>


</dd>
</dl>
</details>

