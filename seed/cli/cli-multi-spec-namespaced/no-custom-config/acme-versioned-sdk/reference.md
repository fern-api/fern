# Reference
## V1
<details><summary><code>client.v1.<a href="/src/api/resources/v1/client.rs">list_users</a>() -> Result&lt;Vec&lt;UserV1&gt;, ApiError&gt;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```rust
use acme_versioned_sdk::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        token: Some("<token>".to_string()),
        ..Default::default()
    };
    let client = AcmeVersionedClient::new(config).expect("Failed to build client");
    client.v1.list_users(None).await;
}
```
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## V2
<details><summary><code>client.v2.<a href="/src/api/resources/v2/client.rs">list_users</a>(page_size: Option&lt;Option&lt;i64&gt;&gt;) -> Result&lt;Vec&lt;UserV2&gt;, ApiError&gt;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```rust
use acme_versioned_sdk::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        token: Some("<token>".to_string()),
        ..Default::default()
    };
    let client = AcmeVersionedClient::new(config).expect("Failed to build client");
    client.v1.list_users(None).await;
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

**page_size:** `Option<i64>` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

