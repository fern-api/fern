# Reference
<details><summary><code>client.<a href="/src/client.rs">extended_inline_request_body</a>(request: Inlined) -> Result<(), ApiError></code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```rust
use seed_extends::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        ..Default::default()
    };
    let client = ExtendsClient::new(config).expect("Failed to build client");
    client
        .extended_inline_request_body(
            &Inlined {
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
