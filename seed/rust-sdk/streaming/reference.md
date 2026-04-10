# Reference
## Dummy
<details><summary><code>client.dummy.<a href="/src/api/resources/dummy/client.rs">generate</a>(request: DummyGenerateRequest) -> Result&lt;StreamResponse, ApiError&gt;</code></summary>
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
        .dummy
        .generate(
            &DummyGenerateRequest {
                stream: true,
                num_events: 1,
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

**stream:** `bool` 
    
</dd>
</dl>

<dl>
<dd>

**num_events:** `i64` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

