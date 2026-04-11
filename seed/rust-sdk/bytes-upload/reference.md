# Reference
## Service
<details><summary><code>client.service.<a href="/src/api/resources/service/client.rs">upload</a>() -> Result&lt;(), ApiError&gt;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```rust
use seed_bytes_upload::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        ..Default::default()
    };
    let client = BytesUploadClient::new(config).expect("Failed to build client");
    client.service.upload(&vec![], None).await;
}
```
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.service.<a href="/src/api/resources/service/client.rs">upload_with_query_params</a>(model: Option&lt;String&gt;, language: Option&lt;Option&lt;String&gt;&gt;) -> Result&lt;(), ApiError&gt;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```rust
use seed_bytes_upload::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        ..Default::default()
    };
    let client = BytesUploadClient::new(config).expect("Failed to build client");
    client
        .service
        .upload_with_query_params(
            &UploadWithQueryParamsRequest {
                model: "nova-2".to_string(),
                body: vec![],
                language: None,
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

**model:** `String` — The model to use for processing
    
</dd>
</dl>

<dl>
<dd>

**language:** `Option<String>` — The language of the content
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

