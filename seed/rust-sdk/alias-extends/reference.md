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
                parent: "parent".to_string(),
                child: "child".to_string(),
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

**child:** `String` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

