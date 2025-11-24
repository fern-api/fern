# Reference
## Users
<details><summary><code>client.users.<a href="/src/api/resources/users/client.rs">list_usernames_custom</a>(starting_after: Option<Option<String>>) -> Result<UsernameCursor, ApiError></code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```rust
use seed_pagination::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        token: Some("<token>".to_string()),
        ..Default::default()
    };
    let client = PaginationClient::new(config).expect("Failed to build client");
    client
        .users
        .list_usernames_custom(
            &ListUsernamesCustomQueryRequest {
                starting_after: Some("starting_after".to_string()),
                ..Default::default()
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

**starting_after:** `Option<String>` 

The cursor used for pagination in order to fetch
the next page of results.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>
