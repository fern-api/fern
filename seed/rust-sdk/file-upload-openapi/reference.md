# Reference
## FileUploadExample
<details><summary><code>client.file_upload_example.<a href="/src/api/resources/file_upload_example/client.rs">upload_file</a>() -> Result<FileId, ApiError></code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Upload a file to the database
</dd>
</dl>
</dd>
</dl>

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
        .file_upload_example
        .upload_file(
            &UploadFileRequest {
                file: std::fs::read("path/to/file").expect("Failed to read file"),
                name: "name".to_string(),
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
