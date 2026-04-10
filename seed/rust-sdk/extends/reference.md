# Reference
## 
<details><summary><code>client.<a href="/src/api/resources//client.rs">extended_inline_request_body</a>(request: ExtendedInlineRequestBodyRequest) -> Result&lt;(), ApiError&gt;</code></summary>
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
        ..extended_inline_request_body(
            &ExtendedInlineRequestBodyRequest {
                name: "name".to_string(),
                docs: "docs".to_string(),
                unique: "unique".to_string(),
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

**unique:** `String` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

