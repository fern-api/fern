# Reference
## Package
<details><summary><code>client.package.<a href="/src/api/resources/package/client.rs">test</a>(for_: Option&lt;String&gt;) -> Result&lt;(), ApiError&gt;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```rust
use seed_nursery_api::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        ..Default::default()
    };
    let client = NurseryApiClient::new(config).expect("Failed to build client");
    client
        .package
        .test(
            &TestQueryRequest {
                r#for: "for".to_string(),
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

**for_:** `String` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>
