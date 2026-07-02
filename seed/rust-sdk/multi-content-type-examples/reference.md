# Reference
## Clients
<details><summary><code>client.clients.<a href="/src/api/resources/clients/client.rs">create</a>(request: ClientRequest) -> Result&lt;ClientResponse, ApiError&gt;</code></summary>
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
        .clients
        .create(
            &ClientRequest {
                client: Some(Client {
                    name: "Acme Corp".to_string(),
                    email: "contact@acme.com".to_string(),
                    ..Default::default()
                }),
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

**client:** `Option<Client>` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

