# Reference
## Knowledge
<details><summary><code>client.knowledge.<a href="/src/api/resources/knowledge/client.rs">upload_knowledge</a>() -> Result&lt;UploadKnowledgeResponse, ApiError&gt;</code></summary>
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
        .knowledge
        .upload_knowledge(
            &UploadKnowledgeRequest {
                file0: b"test file content".to_vec(),
                file1: b"test file content".to_vec(),
                url_path: None,
                display_name2: None,
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


</dd>
</dl>
</details>

