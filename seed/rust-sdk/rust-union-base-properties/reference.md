# Reference
<details><summary><code>client.<a href="/src/client.rs">get</a>() -> Result&lt;ErrorResponse, ApiError&gt;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```rust
use seed_rust_union_base_properties::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        ..Default::default()
    };
    let client = RustUnionBasePropertiesClient::new(config).expect("Failed to build client");
    client.get(None).await;
}
```
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

