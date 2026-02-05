# Reference
<details><summary><code>client.<a href="/src/client.rs">get_account</a>(account_id: String) -> Result&lt;Account, ApiError&gt;</code></summary>
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
    client.get_account(&"account_id".to_string(), None).await;
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

**account_id:** `String` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>
