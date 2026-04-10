# Reference
## 
<details><summary><code>client.<a href="/src/api/resources//client.rs">upload_json_document</a>(request: UploadJsonDocumentRequest) -> Result&lt;UploadDocumentResponse, ApiError&gt;</code></summary>
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
        token: Some("<token>".to_string()),
        ..Default::default()
    };
    let client = ApiClient::new(config).expect("Failed to build client");
    client
        ..upload_json_document(
            &UploadJsonDocumentRequest {
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

**author:** `Option<Option<String>>` 
    
</dd>
</dl>

<dl>
<dd>

**tags:** `Option<Option<Vec<String>>>` 
    
</dd>
</dl>

<dl>
<dd>

**title:** `Option<Option<String>>` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

