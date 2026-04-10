# Reference
## Unknown
<details><summary><code>client.unknown.<a href="/src/api/resources/unknown/client.rs">post</a>(request: serde_json::Value) -> Result&lt;Vec&lt;serde_json::Value&gt;, ApiError&gt;</code></summary>
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
        .unknown
        .post(&serde_json::json!({"key":"value"}), None)
        .await;
}
```
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.unknown.<a href="/src/api/resources/unknown/client.rs">postobject</a>(request: MyObject) -> Result&lt;Vec&lt;serde_json::Value&gt;, ApiError&gt;</code></summary>
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
        .unknown
        .postobject(
            &MyObject {
                unknown: serde_json::json!({"key":"value"}),
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

**unknown:** `serde_json::Value` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

