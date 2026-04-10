# Reference
## Users
<details><summary><code>client.users.<a href="/src/api/resources/users/client.rs">list_with_custom_pager</a>(limit: Option&lt;Option&lt;i64&gt;&gt;, starting_after: Option&lt;Option&lt;String&gt;&gt;) -> Result&lt;UsersListResponse, ApiError&gt;</code></summary>
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
        .list_with_custom_pager(
            &ListWithCustomPagerQueryRequest {
                limit: Some(1),
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

**limit:** `Option<i64>` — The maximum number of results to return.
    
</dd>
</dl>

<dl>
<dd>

**starting_after:** `Option<String>` — The cursor used for pagination.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

