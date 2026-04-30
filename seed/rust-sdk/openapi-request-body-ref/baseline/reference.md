# Reference
## Vendor
<details><summary><code>client.vendor.<a href="/src/api/resources/vendor/client.rs">update_vendor</a>(vendor_id: String, request: UpdateVendorRequest) -> Result&lt;Vendor, ApiError&gt;</code></summary>
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
        .vendor
        .update_vendor(
            &"vendor_id".to_string(),
            &UpdateVendorRequest {
                name: "name".to_string(),
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

**vendor_id:** `String` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.vendor.<a href="/src/api/resources/vendor/client.rs">create_vendor</a>(request: CreateVendorRequest) -> Result&lt;Vendor, ApiError&gt;</code></summary>
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
        .vendor
        .create_vendor(
            &CreateVendorRequest {
                name: "name".to_string(),
                address: None,
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

**name:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**address:** `Option<String>` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## Catalog
<details><summary><code>client.catalog.<a href="/src/api/resources/catalog/client.rs">create_catalog_image</a>() -> Result&lt;CatalogImage, ApiError&gt;</code></summary>
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
        .catalog
        .create_catalog_image(
            &CreateCatalogImageRequest {
                image_file: b"test file content".to_vec(),
                request: CreateCatalogImageRequest {
                    catalog_object_id: "catalog_object_id".to_string(),
                    ..Default::default()
                },
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

<details><summary><code>client.catalog.<a href="/src/api/resources/catalog/client.rs">get_catalog_image</a>(image_id: String) -> Result&lt;CatalogImage, ApiError&gt;</code></summary>
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
        .catalog
        .get_catalog_image(&"image_id".to_string(), None)
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

**image_id:** `String` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## TeamMember
<details><summary><code>client.team_member.<a href="/src/api/resources/team_member/client.rs">update_team_member</a>(team_member_id: String, request: UpdateTeamMemberRequest) -> Result&lt;TeamMember, ApiError&gt;</code></summary>
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
        .team_member
        .update_team_member(
            &"team_member_id".to_string(),
            &UpdateTeamMemberRequest {
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

**team_member_id:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**given_name:** `Option<String>` 
    
</dd>
</dl>

<dl>
<dd>

**family_name:** `Option<String>` 
    
</dd>
</dl>

<dl>
<dd>

**email_address:** `Option<String>` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

