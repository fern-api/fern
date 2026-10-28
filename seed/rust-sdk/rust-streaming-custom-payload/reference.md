# Reference
## Chunks
<details><summary><code>client.chunks.<a href="/src/api/resources/chunks/client.rs">stream</a>() -> Result&lt;Stream&lt;Vec&lt;u8&gt;&gt;, ApiError&gt;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```rust
use seed_rust_streaming_custom_payload::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        ..Default::default()
    };
    let client = RustStreamingCustomPayloadClient::new(config).expect("Failed to build client");
    client.chunks.stream(None).await;
}
```
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## Events
<details><summary><code>client.events.<a href="/src/api/resources/events/client.rs">stream</a>() -> Result&lt;Stream&lt;Vec&lt;u8&gt;&gt;, ApiError&gt;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```rust
use seed_rust_streaming_custom_payload::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        ..Default::default()
    };
    let client = RustStreamingCustomPayloadClient::new(config).expect("Failed to build client");
    client.events.stream(None).await;
}
```
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

