# Reference
## Service
<details><summary><code>client.service.<a href="/src/api/resources/service/client.rs">patch</a>(request: PatchProxyRequest) -> Result<(), ApiError></code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```rust
use seed_content_types::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        ..Default::default()
    };
    let client = ContentTypesClient::new(config).expect("Failed to build client");
    client
        .service
        .patch(
            &PatchProxyRequest {
                application: Some("application".to_string()),
                require_auth: Some(true),
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

**application:** `Option<String>` 
    
</dd>
</dl>

<dl>
<dd>

**require_auth:** `Option<bool>` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.service.<a href="/src/api/resources/service/client.rs">patch_complex</a>(id: String, request: PatchComplexRequest) -> Result<(), ApiError></code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Update with JSON merge patch - complex types.
This endpoint demonstrates the distinction between:
- optional<T> fields (can be present or absent, but not null)
- optional<nullable<T>> fields (can be present, absent, or null)
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
use seed_content_types::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        ..Default::default()
    };
    let client = ContentTypesClient::new(config).expect("Failed to build client");
    client
        .service
        .patch_complex(
            &"id".to_string(),
            &PatchComplexRequest {
                name: Some("name".to_string()),
                age: Some(1),
                active: Some(true),
                metadata: Some(HashMap::from([(
                    "metadata".to_string(),
                    serde_json::json!({"key":"value"}),
                )])),
                tags: Some(vec!["tags".to_string(), "tags".to_string()]),
                email: Some(Some("email".to_string())),
                nickname: Some(Some("nickname".to_string())),
                bio: Some(Some("bio".to_string())),
                profile_image_url: Some(Some("profileImageUrl".to_string())),
                settings: Some(Some(HashMap::from([(
                    "settings".to_string(),
                    serde_json::json!({"key":"value"}),
                )]))),
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

**id:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**name:** `Option<String>` 
    
</dd>
</dl>

<dl>
<dd>

**age:** `Option<i64>` 
    
</dd>
</dl>

<dl>
<dd>

**active:** `Option<bool>` 
    
</dd>
</dl>

<dl>
<dd>

**metadata:** `Option<std::collections::HashMap<String, serde_json::Value>>` 
    
</dd>
</dl>

<dl>
<dd>

**tags:** `Option<Vec<String>>` 
    
</dd>
</dl>

<dl>
<dd>

**email:** `Option<Option<String>>` 
    
</dd>
</dl>

<dl>
<dd>

**nickname:** `Option<Option<String>>` 
    
</dd>
</dl>

<dl>
<dd>

**bio:** `Option<Option<String>>` 
    
</dd>
</dl>

<dl>
<dd>

**profile_image_url:** `Option<Option<String>>` 
    
</dd>
</dl>

<dl>
<dd>

**settings:** `Option<Option<std::collections::HashMap<String, serde_json::Value>>>` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.service.<a href="/src/api/resources/service/client.rs">named_patch_with_mixed</a>(id: String, request: NamedMixedPatchRequest) -> Result<(), ApiError></code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Named request with mixed optional/nullable fields and merge-patch content type.
This should trigger the NPE issue when optional fields aren't initialized.
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
use seed_content_types::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        ..Default::default()
    };
    let client = ContentTypesClient::new(config).expect("Failed to build client");
    client
        .service
        .named_patch_with_mixed(
            &"id".to_string(),
            &NamedMixedPatchRequest {
                app_id: Some("appId".to_string()),
                instructions: Some("instructions".to_string()),
                active: Some(true),
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

**id:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**app_id:** `Option<String>` 
    
</dd>
</dl>

<dl>
<dd>

**instructions:** `Option<String>` 
    
</dd>
</dl>

<dl>
<dd>

**active:** `Option<bool>` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.service.<a href="/src/api/resources/service/client.rs">optional_merge_patch_test</a>(request: OptionalMergePatchRequest) -> Result<(), ApiError></code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Test endpoint to verify Optional field initialization and JsonSetter with Nulls.SKIP.
This endpoint should:
1. Not NPE when fields are not provided (tests initialization)
2. Not NPE when fields are explicitly null in JSON (tests Nulls.SKIP)
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
use seed_content_types::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        ..Default::default()
    };
    let client = ContentTypesClient::new(config).expect("Failed to build client");
    client
        .service
        .optional_merge_patch_test(
            &OptionalMergePatchRequest {
                required_field: "requiredField".to_string(),
                optional_string: Some("optionalString".to_string()),
                optional_integer: Some(1),
                optional_boolean: Some(true),
                nullable_string: Some("nullableString".to_string()),
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

**required_field:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**optional_string:** `Option<String>` 
    
</dd>
</dl>

<dl>
<dd>

**optional_integer:** `Option<i64>` 
    
</dd>
</dl>

<dl>
<dd>

**optional_boolean:** `Option<bool>` 
    
</dd>
</dl>

<dl>
<dd>

**nullable_string:** `Option<String>` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.service.<a href="/src/api/resources/service/client.rs">regular_patch</a>(id: String, request: RegularPatchRequest) -> Result<(), ApiError></code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Regular PATCH endpoint without merge-patch semantics
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
use seed_content_types::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        ..Default::default()
    };
    let client = ContentTypesClient::new(config).expect("Failed to build client");
    client
        .service
        .regular_patch(
            &"id".to_string(),
            &RegularPatchRequest {
                field_1: Some("field1".to_string()),
                field_2: Some(1),
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

**id:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**field_1:** `Option<String>` 
    
</dd>
</dl>

<dl>
<dd>

**field_2:** `Option<i64>` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>
