# Reference
## Service
<details><summary><code>client.service.<a href="/src/api/resources/service/client.rs">just_file</a>() -> Result<(), ApiError></code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```rust
use seed_file_upload::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        ..Default::default()
    };
    let client = FileUploadClient::new(config).expect("Failed to build client");
    client
        .service
        .just_file(
            &JustFileRequest {
                file: std::fs::read("path/to/file").expect("Failed to read file"),
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

<details><summary><code>client.service.<a href="/src/api/resources/service/client.rs">optional_args</a>() -> Result<String, ApiError></code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```rust
use seed_file_upload::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        ..Default::default()
    };
    let client = FileUploadClient::new(config).expect("Failed to build client");
    client
        .service
        .optional_args(
            &OptionalArgsRequest {
                image_file: std::fs::read("path/to/file").expect("Failed to read file"),
                request: None,
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

<details><summary><code>client.service.<a href="/src/api/resources/service/client.rs">simple</a>() -> Result<(), ApiError></code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```rust
use seed_file_upload::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        ..Default::default()
    };
    let client = FileUploadClient::new(config).expect("Failed to build client");
    client.service.simple(None).await;
}
```
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>
