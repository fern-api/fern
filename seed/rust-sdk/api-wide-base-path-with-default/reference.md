# Reference
## Widgets
<details><summary><code>client.widgets.<a href="/src/api/resources/widgets/client.rs">create</a>(api_version: String, request: Widget) -> Result&lt;Widget, ApiError&gt;</code></summary>
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
        .widgets
        .create(
            &"v1beta".to_string(),
            &Widget {
                name: "name".to_string(),
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

**api_version:** `String` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

