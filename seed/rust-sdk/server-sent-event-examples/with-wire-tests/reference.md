# Reference
## Completions
<details><summary><code>client.completions.<a href="/src/api/resources/completions/client.rs">stream</a>(request: StreamCompletionRequest) -> Result&lt;Stream&lt;Vec&lt;u8&gt;&gt;, ApiError&gt;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```rust
use seed_server_sent_events::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        ..Default::default()
    };
    let client = ServerSentEventsClient::new(config).expect("Failed to build client");
    client
        .completions
        .stream(
            &StreamCompletionRequest {
                query: "foo".to_string(),
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

**query:** `String` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>
