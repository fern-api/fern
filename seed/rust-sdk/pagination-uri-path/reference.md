# Reference
## Users
<details><summary><code>client.users.<a href="/src/api/resources/users/client.rs">list_with_uri_pagination</a>() -> Result&lt;ListUsersUriPaginationResponse, ApiError&gt;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```rust
use seed_pagination_uri_path::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        token: Some("<token>".to_string()),
        ..Default::default()
    };
    let client = PaginationUriPathClient::new(config).expect("Failed to build client");
    client.users.list_with_uri_pagination(None).await;
}
```
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.users.<a href="/src/api/resources/users/client.rs">list_with_path_pagination</a>() -> Result&lt;ListUsersPathPaginationResponse, ApiError&gt;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```rust
use seed_pagination_uri_path::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        token: Some("<token>".to_string()),
        ..Default::default()
    };
    let client = PaginationUriPathClient::new(config).expect("Failed to build client");
    client.users.list_with_path_pagination(None).await;
}
```
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

