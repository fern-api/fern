# Reference
## Ec2
<details><summary><code>client.ec_2.<a href="/src/api/resources/ec_2/client.rs">boot_instance</a>(request: BootInstanceRequest) -> Result<(), ApiError></code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```rust
use seed_multi_url_environment::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        token: Some("<token>".to_string()),
        ..Default::default()
    };
    let client = MultiUrlEnvironmentClient::new(config).expect("Failed to build client");
    client
        .ec_2
        .boot_instance(
            &BootInstanceRequest {
                size: "size".to_string(),
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

**size:** `String` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## S3
<details><summary><code>client.s_3.<a href="/src/api/resources/s_3/client.rs">get_presigned_url</a>(request: GetPresignedUrlRequest) -> Result<String, ApiError></code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```rust
use seed_multi_url_environment::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        token: Some("<token>".to_string()),
        ..Default::default()
    };
    let client = MultiUrlEnvironmentClient::new(config).expect("Failed to build client");
    client
        .s_3
        .get_presigned_url(
            &GetPresignedUrlRequest {
                s_3_key: "s3Key".to_string(),
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

**s_3_key:** `String` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>
