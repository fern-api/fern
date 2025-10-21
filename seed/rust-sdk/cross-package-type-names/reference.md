# Reference
## FolderA Service
<details><summary><code>client.folder_a().service.<a href="/src/api/resources/folder_a/service/client.rs">get_direct_thread</a>() -> Result<Response, ApiError></code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```rust
use seed_cross_package_type_names::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        ..Default::default()
    };
    let client = CrossPackageTypeNamesClient::new(config).expect("Failed to build client");
    client.folder_a.service.get_direct_thread(None).await;
}
```
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## FolderD Service
<details><summary><code>client.folder_d().service.<a href="/src/api/resources/folder_d/service/client.rs">get_direct_thread</a>() -> Result<Response, ApiError></code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```rust
use seed_cross_package_type_names::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        ..Default::default()
    };
    let client = CrossPackageTypeNamesClient::new(config).expect("Failed to build client");
    client.folder_a.service.get_direct_thread(None).await;
}
```
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## Foo
<details><summary><code>client.foo.<a href="/src/api/resources/foo/client.rs">find</a>(request: FindRequest, optional_string: Option<OptionalString>) -> Result<ImportingType, ApiError></code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```rust
use seed_cross_package_type_names::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        ..Default::default()
    };
    let client = CrossPackageTypeNamesClient::new(config).expect("Failed to build client");
    client
        .foo
        .find(
            &FindRequest {
                optional_string: OptionalString(Some("optionalString".to_string())),
                public_property: Some("publicProperty".to_string()),
                private_property: Some(1),
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

**public_property:** `Option<String>` 
    
</dd>
</dl>

<dl>
<dd>

**private_property:** `Option<i64>` 
    
</dd>
</dl>

<dl>
<dd>

**optional_string:** `OptionalString` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>
