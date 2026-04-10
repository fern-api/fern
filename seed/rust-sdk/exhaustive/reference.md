# Reference
## EndpointsContainer
<details><summary><code>client.endpoints_container.<a href="/src/api/resources/endpoints_container/client.rs">endpoints_container_get_and_return_list_of_primitives</a>(request: Vec&lt;String&gt;) -> Result&lt;Vec&lt;String&gt;, ApiError&gt;</code></summary>
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
        .endpoints_container
        .endpoints_container_get_and_return_list_of_primitives(&vec!["string".to_string()], None)
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

<details><summary><code>client.endpoints_container.<a href="/src/api/resources/endpoints_container/client.rs">endpoints_container_get_and_return_list_of_objects</a>(request: Vec&lt;TypesObjectWithRequiredField&gt;) -> Result&lt;Vec&lt;TypesObjectWithRequiredField&gt;, ApiError&gt;</code></summary>
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
        .endpoints_container
        .endpoints_container_get_and_return_list_of_objects(
            &vec![TypesObjectWithRequiredField {
                string: "string".to_string(),
                ..Default::default()
            }],
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

<details><summary><code>client.endpoints_container.<a href="/src/api/resources/endpoints_container/client.rs">endpoints_container_get_and_return_set_of_primitives</a>(request: Vec&lt;String&gt;) -> Result&lt;Vec&lt;String&gt;, ApiError&gt;</code></summary>
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
        .endpoints_container
        .endpoints_container_get_and_return_set_of_primitives(&vec!["string".to_string()], None)
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

<details><summary><code>client.endpoints_container.<a href="/src/api/resources/endpoints_container/client.rs">endpoints_container_get_and_return_set_of_objects</a>(request: Vec&lt;TypesObjectWithRequiredField&gt;) -> Result&lt;Vec&lt;TypesObjectWithRequiredField&gt;, ApiError&gt;</code></summary>
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
        .endpoints_container
        .endpoints_container_get_and_return_set_of_objects(
            &vec![TypesObjectWithRequiredField {
                string: "string".to_string(),
                ..Default::default()
            }],
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

<details><summary><code>client.endpoints_container.<a href="/src/api/resources/endpoints_container/client.rs">endpoints_container_get_and_return_map_prim_to_prim</a>(request: std::collections::HashMap&lt;String, String&gt;) -> Result&lt;std::collections::HashMap&lt;String, String&gt;, ApiError&gt;</code></summary>
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
        .endpoints_container
        .endpoints_container_get_and_return_map_prim_to_prim(
            &HashMap::from([("key".to_string(), "value".to_string())]),
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

<details><summary><code>client.endpoints_container.<a href="/src/api/resources/endpoints_container/client.rs">endpoints_container_get_and_return_map_of_prim_to_object</a>(request: std::collections::HashMap&lt;String, TypesObjectWithRequiredField&gt;) -> Result&lt;std::collections::HashMap&lt;String, TypesObjectWithRequiredField&gt;, ApiError&gt;</code></summary>
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
        .endpoints_container
        .endpoints_container_get_and_return_map_of_prim_to_object(
            &HashMap::from([(
                "key".to_string(),
                TypesObjectWithRequiredField {
                    string: "string".to_string(),
                    ..Default::default()
                },
            )]),
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

<details><summary><code>client.endpoints_container.<a href="/src/api/resources/endpoints_container/client.rs">endpoints_container_get_and_return_map_of_prim_to_undiscriminated_union</a>(request: std::collections::HashMap&lt;String, TypesMixedType&gt;) -> Result&lt;std::collections::HashMap&lt;String, TypesMixedType&gt;, ApiError&gt;</code></summary>
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
        .endpoints_container
        .endpoints_container_get_and_return_map_of_prim_to_undiscriminated_union(
            &HashMap::from([("key".to_string(), TypesMixedType::Double(1.1))]),
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

<details><summary><code>client.endpoints_container.<a href="/src/api/resources/endpoints_container/client.rs">endpoints_container_get_and_return_optional</a>(request: TypesObjectWithRequiredField) -> Result&lt;TypesObjectWithRequiredField, ApiError&gt;</code></summary>
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
        .endpoints_container
        .endpoints_container_get_and_return_optional(
            &TypesObjectWithRequiredField {
                string: "string".to_string(),
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


</dd>
</dl>
</details>

## EndpointsContentType
<details><summary><code>client.endpoints_content_type.<a href="/src/api/resources/endpoints_content_type/client.rs">endpoints_content_type_post_json_patch_content_type</a>(request: TypesObjectWithOptionalField) -> Result&lt;(), ApiError&gt;</code></summary>
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
        .endpoints_content_type
        .endpoints_content_type_post_json_patch_content_type(
            &TypesObjectWithOptionalField {
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


</dd>
</dl>
</details>

<details><summary><code>client.endpoints_content_type.<a href="/src/api/resources/endpoints_content_type/client.rs">endpoints_content_type_post_json_patch_content_with_charset_type</a>(request: TypesObjectWithOptionalField) -> Result&lt;(), ApiError&gt;</code></summary>
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
        .endpoints_content_type
        .endpoints_content_type_post_json_patch_content_with_charset_type(
            &TypesObjectWithOptionalField {
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


</dd>
</dl>
</details>

## EndpointsEnum
<details><summary><code>client.endpoints_enum.<a href="/src/api/resources/endpoints_enum/client.rs">endpoints_enum_get_and_return_enum</a>(request: TypesWeatherReport) -> Result&lt;TypesWeatherReport, ApiError&gt;</code></summary>
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
        .endpoints_enum
        .endpoints_enum_get_and_return_enum(&TypesWeatherReport::Sunny, None)
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

## EndpointsHttpMethods
<details><summary><code>client.endpoints_http_methods.<a href="/src/api/resources/endpoints_http_methods/client.rs">endpoints_http_methods_test_get</a>(id: String) -> Result&lt;String, ApiError&gt;</code></summary>
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
        .endpoints_http_methods
        .endpoints_http_methods_test_get(&"id".to_string(), None)
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

<details><summary><code>client.endpoints_http_methods.<a href="/src/api/resources/endpoints_http_methods/client.rs">endpoints_http_methods_test_put</a>(id: String, request: TypesObjectWithRequiredField) -> Result&lt;TypesObjectWithOptionalField, ApiError&gt;</code></summary>
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
        .endpoints_http_methods
        .endpoints_http_methods_test_put(
            &"id".to_string(),
            &TypesObjectWithRequiredField {
                string: "string".to_string(),
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
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.endpoints_http_methods.<a href="/src/api/resources/endpoints_http_methods/client.rs">endpoints_http_methods_test_delete</a>(id: String) -> Result&lt;bool, ApiError&gt;</code></summary>
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
        .endpoints_http_methods
        .endpoints_http_methods_test_delete(&"id".to_string(), None)
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

<details><summary><code>client.endpoints_http_methods.<a href="/src/api/resources/endpoints_http_methods/client.rs">endpoints_http_methods_test_patch</a>(id: String, request: TypesObjectWithOptionalField) -> Result&lt;TypesObjectWithOptionalField, ApiError&gt;</code></summary>
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
        .endpoints_http_methods
        .endpoints_http_methods_test_patch(
            &"id".to_string(),
            &TypesObjectWithOptionalField {
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
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.endpoints_http_methods.<a href="/src/api/resources/endpoints_http_methods/client.rs">endpoints_http_methods_test_post</a>(request: TypesObjectWithRequiredField) -> Result&lt;TypesObjectWithOptionalField, ApiError&gt;</code></summary>
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
        .endpoints_http_methods
        .endpoints_http_methods_test_post(
            &TypesObjectWithRequiredField {
                string: "string".to_string(),
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


</dd>
</dl>
</details>

## EndpointsObject
<details><summary><code>client.endpoints_object.<a href="/src/api/resources/endpoints_object/client.rs">endpoints_object_get_and_return_with_optional_field</a>(request: TypesObjectWithOptionalField) -> Result&lt;TypesObjectWithOptionalField, ApiError&gt;</code></summary>
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
        .endpoints_object
        .endpoints_object_get_and_return_with_optional_field(
            &TypesObjectWithOptionalField {
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


</dd>
</dl>
</details>

<details><summary><code>client.endpoints_object.<a href="/src/api/resources/endpoints_object/client.rs">endpoints_object_get_and_return_with_required_field</a>(request: TypesObjectWithRequiredField) -> Result&lt;TypesObjectWithRequiredField, ApiError&gt;</code></summary>
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
        .endpoints_object
        .endpoints_object_get_and_return_with_required_field(
            &TypesObjectWithRequiredField {
                string: "string".to_string(),
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


</dd>
</dl>
</details>

<details><summary><code>client.endpoints_object.<a href="/src/api/resources/endpoints_object/client.rs">endpoints_object_get_and_return_with_map_of_map</a>(request: TypesObjectWithMapOfMap) -> Result&lt;TypesObjectWithMapOfMap, ApiError&gt;</code></summary>
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
        .endpoints_object
        .endpoints_object_get_and_return_with_map_of_map(
            &TypesObjectWithMapOfMap {
                map: HashMap::from([(
                    "key".to_string(),
                    HashMap::from([("key".to_string(), "value".to_string())]),
                )]),
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


</dd>
</dl>
</details>

<details><summary><code>client.endpoints_object.<a href="/src/api/resources/endpoints_object/client.rs">endpoints_object_get_and_return_nested_with_optional_field</a>(request: TypesNestedObjectWithOptionalField) -> Result&lt;TypesNestedObjectWithOptionalField, ApiError&gt;</code></summary>
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
        .endpoints_object
        .endpoints_object_get_and_return_nested_with_optional_field(
            &TypesNestedObjectWithOptionalField {
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


</dd>
</dl>
</details>

<details><summary><code>client.endpoints_object.<a href="/src/api/resources/endpoints_object/client.rs">endpoints_object_get_and_return_nested_with_required_field</a>(string: String, request: TypesNestedObjectWithRequiredField) -> Result&lt;TypesNestedObjectWithRequiredField, ApiError&gt;</code></summary>
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
        .endpoints_object
        .endpoints_object_get_and_return_nested_with_required_field(
            &"string".to_string(),
            &TypesNestedObjectWithRequiredField {
                string: "string".to_string(),
                nested_object: TypesObjectWithOptionalField {
                    ..Default::default()
                },
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

**string:** `String` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.endpoints_object.<a href="/src/api/resources/endpoints_object/client.rs">endpoints_object_get_and_return_nested_with_required_field_as_list</a>(request: Vec&lt;TypesNestedObjectWithRequiredField&gt;) -> Result&lt;TypesNestedObjectWithRequiredField, ApiError&gt;</code></summary>
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
        .endpoints_object
        .endpoints_object_get_and_return_nested_with_required_field_as_list(
            &vec![TypesNestedObjectWithRequiredField {
                string: "string".to_string(),
                nested_object: TypesObjectWithOptionalField {
                    ..Default::default()
                },
                ..Default::default()
            }],
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

<details><summary><code>client.endpoints_object.<a href="/src/api/resources/endpoints_object/client.rs">endpoints_object_get_and_return_with_unknown_field</a>(request: TypesObjectWithUnknownField) -> Result&lt;TypesObjectWithUnknownField, ApiError&gt;</code></summary>
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
        .endpoints_object
        .endpoints_object_get_and_return_with_unknown_field(
            &TypesObjectWithUnknownField {
                unknown: serde_json::json!({"key":"value"}),
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


</dd>
</dl>
</details>

<details><summary><code>client.endpoints_object.<a href="/src/api/resources/endpoints_object/client.rs">endpoints_object_get_and_return_with_documented_unknown_type</a>(request: TypesObjectWithDocumentedUnknownType) -> Result&lt;TypesObjectWithDocumentedUnknownType, ApiError&gt;</code></summary>
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
        .endpoints_object
        .endpoints_object_get_and_return_with_documented_unknown_type(
            &TypesObjectWithDocumentedUnknownType {
                documented_unknown_type: TypesDocumentedUnknownType(
                    serde_json::json!({"key":"value"}),
                ),
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


</dd>
</dl>
</details>

<details><summary><code>client.endpoints_object.<a href="/src/api/resources/endpoints_object/client.rs">endpoints_object_get_and_return_map_of_documented_unknown_type</a>(request: TypesMapOfDocumentedUnknownType) -> Result&lt;TypesMapOfDocumentedUnknownType, ApiError&gt;</code></summary>
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
        .endpoints_object
        .endpoints_object_get_and_return_map_of_documented_unknown_type(
            &TypesMapOfDocumentedUnknownType(HashMap::from([])),
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

<details><summary><code>client.endpoints_object.<a href="/src/api/resources/endpoints_object/client.rs">endpoints_object_get_and_return_with_mixed_required_and_optional_fields</a>(request: TypesObjectWithMixedRequiredAndOptionalFields) -> Result&lt;TypesObjectWithMixedRequiredAndOptionalFields, ApiError&gt;</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Tests that dynamic snippets include all required properties in the
object initializer, even when the example omits some required fields.
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
        token: Some("<token>".to_string()),
        ..Default::default()
    };
    let client = ApiClient::new(config).expect("Failed to build client");
    client
        .endpoints_object
        .endpoints_object_get_and_return_with_mixed_required_and_optional_fields(
            &TypesObjectWithMixedRequiredAndOptionalFields {
                required_string: "requiredString".to_string(),
                required_integer: 1,
                required_long: 1000000,
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


</dd>
</dl>
</details>

<details><summary><code>client.endpoints_object.<a href="/src/api/resources/endpoints_object/client.rs">endpoints_object_get_and_return_with_required_nested_object</a>(request: TypesObjectWithRequiredNestedObject) -> Result&lt;TypesObjectWithRequiredNestedObject, ApiError&gt;</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Tests that dynamic snippets recursively construct default objects for
required properties whose type is a named object. When the example
omits the nested object, the generator should construct a default
initializer with the nested object's required properties filled in.
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
        token: Some("<token>".to_string()),
        ..Default::default()
    };
    let client = ApiClient::new(config).expect("Failed to build client");
    client
        .endpoints_object
        .endpoints_object_get_and_return_with_required_nested_object(
            &TypesObjectWithRequiredNestedObject {
                required_string: "requiredString".to_string(),
                required_object: TypesNestedObjectWithRequiredField {
                    string: "string".to_string(),
                    nested_object: TypesObjectWithOptionalField {
                        ..Default::default()
                    },
                    ..Default::default()
                },
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


</dd>
</dl>
</details>

<details><summary><code>client.endpoints_object.<a href="/src/api/resources/endpoints_object/client.rs">endpoints_object_get_and_return_with_datetime_like_string</a>(request: TypesObjectWithDatetimeLikeString) -> Result&lt;TypesObjectWithDatetimeLikeString, ApiError&gt;</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Tests that string fields containing datetime-like values are NOT reformatted.
The datetimeLikeString field should preserve its exact value "2023-08-31T14:15:22Z"
without being converted to "2023-08-31T14:15:22.000Z".
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
        token: Some("<token>".to_string()),
        ..Default::default()
    };
    let client = ApiClient::new(config).expect("Failed to build client");
    client
        .endpoints_object
        .endpoints_object_get_and_return_with_datetime_like_string(
            &TypesObjectWithDatetimeLikeString {
                datetime_like_string: "datetimeLikeString".to_string(),
                actual_datetime: DateTime::parse_from_rfc3339("2024-01-15T09:30:00Z").unwrap(),
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


</dd>
</dl>
</details>

## EndpointsPagination
<details><summary><code>client.endpoints_pagination.<a href="/src/api/resources/endpoints_pagination/client.rs">endpoints_pagination_list_items</a>(cursor: Option&lt;Option&lt;Option&lt;String&gt;&gt;&gt;, limit: Option&lt;Option&lt;Option&lt;i64&gt;&gt;&gt;) -> Result&lt;EndpointsPaginatedResponse, ApiError&gt;</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

List items with cursor pagination
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
        token: Some("<token>".to_string()),
        ..Default::default()
    };
    let client = ApiClient::new(config).expect("Failed to build client");
    client
        .endpoints_pagination
        .endpoints_pagination_list_items(
            &EndpointsPaginationListItemsQueryRequest {
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

**cursor:** `Option<Option<String>>` — The cursor for pagination
    
</dd>
</dl>

<dl>
<dd>

**limit:** `Option<Option<i64>>` — Maximum number of items to return
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## EndpointsParams
<details><summary><code>client.endpoints_params.<a href="/src/api/resources/endpoints_params/client.rs">endpoints_params_get_with_path</a>(param: String) -> Result&lt;String, ApiError&gt;</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

GET with path param
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
        token: Some("<token>".to_string()),
        ..Default::default()
    };
    let client = ApiClient::new(config).expect("Failed to build client");
    client
        .endpoints_params
        .endpoints_params_get_with_path(&"param".to_string(), None)
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

**param:** `String` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.endpoints_params.<a href="/src/api/resources/endpoints_params/client.rs">endpoints_params_modify_with_path</a>(param: String, request: String) -> Result&lt;String, ApiError&gt;</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

PUT to update with path param
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
        token: Some("<token>".to_string()),
        ..Default::default()
    };
    let client = ApiClient::new(config).expect("Failed to build client");
    client
        .endpoints_params
        .endpoints_params_modify_with_path(&"param".to_string(), &"string".to_string(), None)
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

**param:** `String` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.endpoints_params.<a href="/src/api/resources/endpoints_params/client.rs">endpoints_params_get_with_inline_path</a>(param: String) -> Result&lt;String, ApiError&gt;</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

GET with path param
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
        token: Some("<token>".to_string()),
        ..Default::default()
    };
    let client = ApiClient::new(config).expect("Failed to build client");
    client
        .endpoints_params
        .endpoints_params_get_with_inline_path(&"param".to_string(), None)
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

**param:** `String` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.endpoints_params.<a href="/src/api/resources/endpoints_params/client.rs">endpoints_params_modify_with_inline_path</a>(param: String, request: String) -> Result&lt;String, ApiError&gt;</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

PUT to update with path param
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
        token: Some("<token>".to_string()),
        ..Default::default()
    };
    let client = ApiClient::new(config).expect("Failed to build client");
    client
        .endpoints_params
        .endpoints_params_modify_with_inline_path(&"param".to_string(), &"string".to_string(), None)
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

**param:** `String` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.endpoints_params.<a href="/src/api/resources/endpoints_params/client.rs">endpoints_params_get_with_query</a>(query: Option&lt;String&gt;, number: Option&lt;i64&gt;) -> Result&lt;(), ApiError&gt;</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

GET with query param
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
        token: Some("<token>".to_string()),
        ..Default::default()
    };
    let client = ApiClient::new(config).expect("Failed to build client");
    client
        .endpoints_params
        .endpoints_params_get_with_query(
            &EndpointsParamsGetWithQueryQueryRequest {
                query: "query".to_string(),
                number: 1,
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

**query:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**number:** `i64` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.endpoints_params.<a href="/src/api/resources/endpoints_params/client.rs">endpoints_params_get_with_allow_multiple_query</a>() -> Result&lt;(), ApiError&gt;</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

GET with multiple of same query param
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
        token: Some("<token>".to_string()),
        ..Default::default()
    };
    let client = ApiClient::new(config).expect("Failed to build client");
    client
        .endpoints_params
        .endpoints_params_get_with_allow_multiple_query(
            &EndpointsParamsGetWithAllowMultipleQueryQueryRequest {
                query: vec![Some("query".to_string())],
                number: vec![Some(1)],
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

**query:** `Option<String>` 
    
</dd>
</dl>

<dl>
<dd>

**number:** `Option<i64>` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.endpoints_params.<a href="/src/api/resources/endpoints_params/client.rs">endpoints_params_get_with_path_and_query</a>(param: String, query: Option&lt;String&gt;) -> Result&lt;(), ApiError&gt;</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

GET with path and query params
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
        token: Some("<token>".to_string()),
        ..Default::default()
    };
    let client = ApiClient::new(config).expect("Failed to build client");
    client
        .endpoints_params
        .endpoints_params_get_with_path_and_query(
            &"param".to_string(),
            &EndpointsParamsGetWithPathAndQueryQueryRequest {
                query: "query".to_string(),
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

**param:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**query:** `String` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.endpoints_params.<a href="/src/api/resources/endpoints_params/client.rs">endpoints_params_get_with_inline_path_and_query</a>(param: String, query: Option&lt;String&gt;) -> Result&lt;(), ApiError&gt;</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

GET with path and query params
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
        token: Some("<token>".to_string()),
        ..Default::default()
    };
    let client = ApiClient::new(config).expect("Failed to build client");
    client
        .endpoints_params
        .endpoints_params_get_with_inline_path_and_query(
            &"param".to_string(),
            &EndpointsParamsGetWithInlinePathAndQueryQueryRequest {
                query: "query".to_string(),
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

**param:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**query:** `String` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.endpoints_params.<a href="/src/api/resources/endpoints_params/client.rs">endpoints_params_get_with_boolean_path</a>(param: bool) -> Result&lt;String, ApiError&gt;</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

GET with boolean path param
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
        token: Some("<token>".to_string()),
        ..Default::default()
    };
    let client = ApiClient::new(config).expect("Failed to build client");
    client
        .endpoints_params
        .endpoints_params_get_with_boolean_path(true, None)
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

**param:** `bool` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.endpoints_params.<a href="/src/api/resources/endpoints_params/client.rs">endpoints_params_get_with_path_and_errors</a>(param: String) -> Result&lt;String, ApiError&gt;</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

GET with path param that can throw errors
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
        token: Some("<token>".to_string()),
        ..Default::default()
    };
    let client = ApiClient::new(config).expect("Failed to build client");
    client
        .endpoints_params
        .endpoints_params_get_with_path_and_errors(&"param".to_string(), None)
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

**param:** `String` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## EndpointsPrimitive
<details><summary><code>client.endpoints_primitive.<a href="/src/api/resources/endpoints_primitive/client.rs">endpoints_primitive_get_and_return_string</a>(request: String) -> Result&lt;String, ApiError&gt;</code></summary>
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
        .endpoints_primitive
        .endpoints_primitive_get_and_return_string(&"string".to_string(), None)
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

<details><summary><code>client.endpoints_primitive.<a href="/src/api/resources/endpoints_primitive/client.rs">endpoints_primitive_get_and_return_int</a>(request: i64) -> Result&lt;i64, ApiError&gt;</code></summary>
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
        .endpoints_primitive
        .endpoints_primitive_get_and_return_int(&1, None)
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

<details><summary><code>client.endpoints_primitive.<a href="/src/api/resources/endpoints_primitive/client.rs">endpoints_primitive_get_and_return_long</a>(request: String) -> Result&lt;String, ApiError&gt;</code></summary>
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
        .endpoints_primitive
        .endpoints_primitive_get_and_return_long(&1000000, None)
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

<details><summary><code>client.endpoints_primitive.<a href="/src/api/resources/endpoints_primitive/client.rs">endpoints_primitive_get_and_return_double</a>(request: f64) -> Result&lt;f64, ApiError&gt;</code></summary>
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
        .endpoints_primitive
        .endpoints_primitive_get_and_return_double(&1.1, None)
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

<details><summary><code>client.endpoints_primitive.<a href="/src/api/resources/endpoints_primitive/client.rs">endpoints_primitive_get_and_return_bool</a>(request: bool) -> Result&lt;bool, ApiError&gt;</code></summary>
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
        .endpoints_primitive
        .endpoints_primitive_get_and_return_bool(&true, None)
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

<details><summary><code>client.endpoints_primitive.<a href="/src/api/resources/endpoints_primitive/client.rs">endpoints_primitive_get_and_return_datetime</a>(request: String) -> Result&lt;String, ApiError&gt;</code></summary>
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
        .endpoints_primitive
        .endpoints_primitive_get_and_return_datetime(
            &DateTime::parse_from_rfc3339("2024-01-15T09:30:00Z").unwrap(),
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

<details><summary><code>client.endpoints_primitive.<a href="/src/api/resources/endpoints_primitive/client.rs">endpoints_primitive_get_and_return_date</a>(request: String) -> Result&lt;String, ApiError&gt;</code></summary>
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
        .endpoints_primitive
        .endpoints_primitive_get_and_return_date(
            &NaiveDate::parse_from_str("2023-01-15", "%Y-%m-%d").unwrap(),
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

<details><summary><code>client.endpoints_primitive.<a href="/src/api/resources/endpoints_primitive/client.rs">endpoints_primitive_get_and_return_uuid</a>(request: String) -> Result&lt;String, ApiError&gt;</code></summary>
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
        .endpoints_primitive
        .endpoints_primitive_get_and_return_uuid(&"string".to_string(), None)
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

<details><summary><code>client.endpoints_primitive.<a href="/src/api/resources/endpoints_primitive/client.rs">endpoints_primitive_get_and_return_base64</a>(request: String) -> Result&lt;String, ApiError&gt;</code></summary>
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
        .endpoints_primitive
        .endpoints_primitive_get_and_return_base64(&"string".to_string(), None)
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

## EndpointsPut
<details><summary><code>client.endpoints_put.<a href="/src/api/resources/endpoints_put/client.rs">endpoints_put_add</a>(id: String) -> Result&lt;EndpointsPutResponse, ApiError&gt;</code></summary>
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
        .endpoints_put
        .endpoints_put_add(&"id".to_string(), None)
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

## EndpointsUnion
<details><summary><code>client.endpoints_union.<a href="/src/api/resources/endpoints_union/client.rs">endpoints_union_get_and_return_union</a>(request: TypesAnimal) -> Result&lt;TypesAnimal, ApiError&gt;</code></summary>
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
        .endpoints_union
        .endpoints_union_get_and_return_union(
            &TypesAnimal::TypesAnimalZero(TypesAnimalZero {
                types_dog_fields: TypesDog {
                    name: "name".to_string(),
                    likes_to_woof: true,
                    ..Default::default()
                },
                animal: TypesAnimalZeroAnimal::Dog,
            }),
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

## EndpointsUrLs
<details><summary><code>client.endpoints_ur_ls.<a href="/src/api/resources/endpoints_ur_ls/client.rs">endpoints_urls_with_mixed_case</a>() -> Result&lt;String, ApiError&gt;</code></summary>
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
        .endpoints_ur_ls
        .endpoints_urls_with_mixed_case(None)
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

<details><summary><code>client.endpoints_ur_ls.<a href="/src/api/resources/endpoints_ur_ls/client.rs">endpoints_urls_no_ending_slash</a>() -> Result&lt;String, ApiError&gt;</code></summary>
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
        .endpoints_ur_ls
        .endpoints_urls_no_ending_slash(None)
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

<details><summary><code>client.endpoints_ur_ls.<a href="/src/api/resources/endpoints_ur_ls/client.rs">endpoints_urls_with_ending_slash</a>() -> Result&lt;String, ApiError&gt;</code></summary>
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
        .endpoints_ur_ls
        .endpoints_urls_with_ending_slash(None)
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

<details><summary><code>client.endpoints_ur_ls.<a href="/src/api/resources/endpoints_ur_ls/client.rs">endpoints_urls_with_underscores</a>() -> Result&lt;String, ApiError&gt;</code></summary>
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
        .endpoints_ur_ls
        .endpoints_urls_with_underscores(None)
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

## Inlinedrequests
<details><summary><code>client.inlinedrequests.<a href="/src/api/resources/inlinedrequests/client.rs">postwithobjectbodyandresponse</a>(request: InlinedRequestsPostWithObjectBodyandResponseRequest) -> Result&lt;TypesObjectWithOptionalField, ApiError&gt;</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

POST with custom object in request body, response is an object
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
        token: Some("<token>".to_string()),
        ..Default::default()
    };
    let client = ApiClient::new(config).expect("Failed to build client");
    client
        .inlinedrequests
        .postwithobjectbodyandresponse(
            &InlinedRequestsPostWithObjectBodyandResponseRequest {
                string: "string".to_string(),
                integer: 1,
                nested_object: TypesObjectWithOptionalField {
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

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**string:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**integer:** `i64` 
    
</dd>
</dl>

<dl>
<dd>

**nested_object:** `TypesObjectWithOptionalField` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## Noauth
<details><summary><code>client.noauth.<a href="/src/api/resources/noauth/client.rs">postwithnoauth</a>(request: serde_json::Value) -> Result&lt;bool, ApiError&gt;</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

POST request with no auth
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
        token: Some("<token>".to_string()),
        ..Default::default()
    };
    let client = ApiClient::new(config).expect("Failed to build client");
    client
        .noauth
        .postwithnoauth(&serde_json::json!({"key":"value"}), None)
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

## Noreqbody
<details><summary><code>client.noreqbody.<a href="/src/api/resources/noreqbody/client.rs">getwithnorequestbody</a>() -> Result&lt;TypesObjectWithOptionalField, ApiError&gt;</code></summary>
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
    client.noreqbody.getwithnorequestbody(None).await;
}
```
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.noreqbody.<a href="/src/api/resources/noreqbody/client.rs">postwithnorequestbody</a>() -> Result&lt;String, ApiError&gt;</code></summary>
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
    client.noreqbody.postwithnorequestbody(None).await;
}
```
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## Reqwithheaders
<details><summary><code>client.reqwithheaders.<a href="/src/api/resources/reqwithheaders/client.rs">getwithcustomheader</a>(request: String) -> Result&lt;(), ApiError&gt;</code></summary>
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
        .reqwithheaders
        .getwithcustomheader(
            &"string".to_string(),
            Some(
                RequestOptions::new()
                    .additional_header("X-TEST-ENDPOINT-HEADER", "X-TEST-ENDPOINT-HEADER"),
            ),
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

