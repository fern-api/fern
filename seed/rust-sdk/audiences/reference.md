# Reference
## FolderAService
<details><summary><code>client.folder_a_service.<a href="/src/api/resources/folder_a_service/client.rs">folder_a_service_get_direct_thread</a>() -> Result&lt;FolderAResponse, ApiError&gt;</code></summary>
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
        .folder_a_service
        .folder_a_service_get_direct_thread(
            &FolderAServiceGetDirectThreadQueryRequest {
                ids: vec![Some("ids".to_string())],
                tags: vec![Some("tags".to_string())],
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

**ids:** `Option<String>` 
    
</dd>
</dl>

<dl>
<dd>

**tags:** `Option<String>` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## Foo
<details><summary><code>client.foo.<a href="/src/api/resources/foo/client.rs">find</a>(request: FooFindRequest, optional_string: Option&lt;Option&lt;Option&lt;OptionalString&gt;&gt;&gt;) -> Result&lt;ImportingType, ApiError&gt;</code></summary>
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
        .foo
        .find(
            &FooFindRequest {
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

**public_property:** `Option<Option<String>>` 
    
</dd>
</dl>

<dl>
<dd>

**private_property:** `Option<Option<i64>>` 
    
</dd>
</dl>

<dl>
<dd>

**optional_string:** `Option<Option<OptionalString>>` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## FolderDService
<details><summary><code>client.folder_d_service.<a href="/src/api/resources/folder_d_service/client.rs">folder_d_service_get_direct_thread</a>() -> Result&lt;FolderDResponse, ApiError&gt;</code></summary>
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
        .folder_d_service
        .folder_d_service_get_direct_thread(None)
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

