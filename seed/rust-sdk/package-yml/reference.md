# Reference
<details><summary><code>client.<a href="/src/client.rs">echo</a>(id: String, request: EchoRequest) -> Result<String, ApiError></code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```rust
use seed_package_yml::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        ..Default::default()
    };
    let client = PackageYmlClient::new(config).expect("Failed to build client");
    client
        .echo(
            &"id-ksfd9c1".to_string(),
            &EchoRequest {
                name: "Hello world!".to_string(),
                size: 20,
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

**id:** `String` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## Service
<details><summary><code>client.service.<a href="/src/api/resources/service/client.rs">nop</a>(id: String, nested_id: String) -> Result<(), ApiError></code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```rust
use seed_package_yml::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        ..Default::default()
    };
    let client = PackageYmlClient::new(config).expect("Failed to build client");
    client
        .service
        .nop(&"id-a2ijs82".to_string(), &"id-219xca8".to_string(), None)
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

**id:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**nested_id:** `String` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>
