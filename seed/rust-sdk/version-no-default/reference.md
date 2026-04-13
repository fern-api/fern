# Reference
## User
<details><summary><code>client.user.<a href="/src/api/resources/user/client.rs">getuser</a>(user_id: UserId) -> Result&lt;User, ApiError&gt;</code></summary>
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
        .user
        .getuser(&UserId("userId".to_string()), None)
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

**user_id:** `UserId` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

