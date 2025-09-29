# Reference
## User
<details><summary><code>client.user.<a href="/src/api/resources/user/client.rs">head</a>() -> Result<(), ApiError></code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```rust
use seed_http_head::{ClientConfig, HttpHeadClient};

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        ..Default::default()
    };
    let client = HttpHeadClient::new(config).expect("Failed to build client");
    client.user.head(None).await;
}
```
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.user.<a href="/src/api/resources/user/client.rs">list</a>(limit: Option<i64>) -> Result<Vec<User>, ApiError></code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```rust
use seed_http_head::{ClientConfig, HttpHeadClient, ListQueryRequest};

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        ..Default::default()
    };
    let client = HttpHeadClient::new(config).expect("Failed to build client");
    client.user.list(&ListQueryRequest { limit: 1 }, None).await;
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

**limit:** `i64` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>
