# Reference
## Dummy
<details><summary><code>client.dummy.<a href="/src/api/resources/dummy/client.rs">generate</a>(request: GenerateRequest) -> Result<Stream<Vec<u8>>, ApiError></code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```rust
use seed_streaming::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        ..Default::default()
    };
    let client = StreamingClient::new(config).expect("Failed to build client");
    client
        .dummy
        .generate(
            &GenerateRequest {
                stream: false,
                num_events: 5,
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
