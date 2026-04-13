# Reference
## Users
<details><summary><code>client.users.<a href="/src/api/resources/users/client.rs">listwithuripagination</a>() -> Result&lt;ListUsersUriPaginationResponse, ApiError&gt;</code></summary>
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
    client.users.listwithuripagination(None).await;
}
```
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.users.<a href="/src/api/resources/users/client.rs">listwithpathpagination</a>() -> Result&lt;ListUsersPathPaginationResponse, ApiError&gt;</code></summary>
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
    client.users.listwithpathpagination(None).await;
}
```
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

