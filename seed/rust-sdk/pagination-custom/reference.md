# Reference
## Users
<details><summary><code>client.users.<a href="/src/api/resources/users/client.rs">listwithcustompager</a>(limit: Option&lt;Option&lt;Option&lt;i64&gt;&gt;&gt;, starting_after: Option&lt;Option&lt;Option&lt;String&gt;&gt;&gt;) -> Result&lt;UsersListResponse, ApiError&gt;</code></summary>
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
        .users
        .listwithcustompager(
            &ListwithcustompagerQueryRequest {
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

**limit:** `Option<Option<i64>>` — The maximum number of results to return.
    
</dd>
</dl>

<dl>
<dd>

**starting_after:** `Option<Option<String>>` — The cursor used for pagination.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

