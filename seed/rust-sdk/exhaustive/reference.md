# Reference
## Endpoints Container
<details><summary><code>client.endpoints().container.<a href="/src/api/resources/endpoints/container/client.rs">get_and_return_list_of_primitives</a>(request: Vec&lt;String&gt;) -> Result&lt;Vec&lt;String&gt;, ApiError&gt;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```rust
use seed_exhaustive::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        token: Some("<token>".to_string()),
        ..Default::default()
    };
    let client = ExhaustiveClient::new(config).expect("Failed to build client");
    client
        .endpoints
        .container
        .get_and_return_list_of_primitives(&vec!["string".to_string(), "string".to_string()], None)
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

<details><summary><code>client.endpoints().container.<a href="/src/api/resources/endpoints/container/client.rs">get_and_return_list_of_objects</a>(request: Vec&lt;ObjectWithRequiredField&gt;) -> Result&lt;Vec&lt;ObjectWithRequiredField&gt;, ApiError&gt;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```rust
use seed_exhaustive::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        token: Some("<token>".to_string()),
        ..Default::default()
    };
    let client = ExhaustiveClient::new(config).expect("Failed to build client");
    client
        .endpoints
        .container
        .get_and_return_list_of_objects(
            &vec![
                ObjectWithRequiredField {
                    string: "string".to_string(),
                },
                ObjectWithRequiredField {
                    string: "string".to_string(),
                },
            ],
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

<details><summary><code>client.endpoints().container.<a href="/src/api/resources/endpoints/container/client.rs">get_and_return_set_of_primitives</a>(request: Vec&lt;String&gt;) -> Result&lt;Vec&lt;String&gt;, ApiError&gt;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```rust
use seed_exhaustive::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        token: Some("<token>".to_string()),
        ..Default::default()
    };
    let client = ExhaustiveClient::new(config).expect("Failed to build client");
    client
        .endpoints
        .container
        .get_and_return_set_of_primitives(&HashSet::from(["string".to_string()]), None)
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

<details><summary><code>client.endpoints().container.<a href="/src/api/resources/endpoints/container/client.rs">get_and_return_set_of_objects</a>(request: Vec&lt;ObjectWithRequiredField&gt;) -> Result&lt;Vec&lt;ObjectWithRequiredField&gt;, ApiError&gt;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```rust
use seed_exhaustive::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        token: Some("<token>".to_string()),
        ..Default::default()
    };
    let client = ExhaustiveClient::new(config).expect("Failed to build client");
    client
        .endpoints
        .container
        .get_and_return_set_of_objects(
            &HashSet::from([ObjectWithRequiredField {
                string: "string".to_string(),
            }]),
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

<details><summary><code>client.endpoints().container.<a href="/src/api/resources/endpoints/container/client.rs">get_and_return_map_prim_to_prim</a>(request: std::collections::HashMap&lt;String, String&gt;) -> Result&lt;std::collections::HashMap&lt;String, String&gt;, ApiError&gt;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```rust
use seed_exhaustive::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        token: Some("<token>".to_string()),
        ..Default::default()
    };
    let client = ExhaustiveClient::new(config).expect("Failed to build client");
    client
        .endpoints
        .container
        .get_and_return_map_prim_to_prim(
            &HashMap::from([("string".to_string(), "string".to_string())]),
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

<details><summary><code>client.endpoints().container.<a href="/src/api/resources/endpoints/container/client.rs">get_and_return_map_of_prim_to_object</a>(request: std::collections::HashMap&lt;String, ObjectWithRequiredField&gt;) -> Result&lt;std::collections::HashMap&lt;String, ObjectWithRequiredField&gt;, ApiError&gt;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```rust
use seed_exhaustive::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        token: Some("<token>".to_string()),
        ..Default::default()
    };
    let client = ExhaustiveClient::new(config).expect("Failed to build client");
    client
        .endpoints
        .container
        .get_and_return_map_of_prim_to_object(
            &HashMap::from([(
                "string".to_string(),
                ObjectWithRequiredField {
                    string: "string".to_string(),
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

<details><summary><code>client.endpoints().container.<a href="/src/api/resources/endpoints/container/client.rs">get_and_return_optional</a>(request: Option&lt;ObjectWithRequiredField&gt;) -> Result&lt;Option&lt;ObjectWithRequiredField&gt;, ApiError&gt;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```rust
use seed_exhaustive::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        token: Some("<token>".to_string()),
        ..Default::default()
    };
    let client = ExhaustiveClient::new(config).expect("Failed to build client");
    client
        .endpoints
        .container
        .get_and_return_optional(
            &Some(ObjectWithRequiredField {
                string: "string".to_string(),
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

## Endpoints ContentType
<details><summary><code>client.endpoints().content_type.<a href="/src/api/resources/endpoints/content_type/client.rs">post_json_patch_content_type</a>(request: ObjectWithOptionalField) -> Result&lt;(), ApiError&gt;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```rust
use seed_exhaustive::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        token: Some("<token>".to_string()),
        ..Default::default()
    };
    let client = ExhaustiveClient::new(config).expect("Failed to build client");
    client
        .endpoints
        .content_type
        .post_json_patch_content_type(
            &ObjectWithOptionalField {
                string: Some("string".to_string()),
                integer: Some(1),
                long: Some(1000000),
                double: Some(1.1),
                bool: Some(true),
                datetime: Some(DateTime::parse_from_rfc3339("2024-01-15T09:30:00Z").unwrap()),
                date: Some(NaiveDate::parse_from_str("2023-01-15", "%Y-%m-%d").unwrap()),
                uuid: Some(Uuid::parse_str("d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32").unwrap()),
                base_64: Some(
                    base64::engine::general_purpose::STANDARD
                        .decode("SGVsbG8gd29ybGQh")
                        .unwrap(),
                ),
                list: Some(vec!["list".to_string(), "list".to_string()]),
                set: Some(HashSet::from(["set".to_string()])),
                map: Some(HashMap::from([(1, "map".to_string())])),
                bigint: Some(BigInt::parse_bytes("1000000".as_bytes(), 10).unwrap()),
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

<details><summary><code>client.endpoints().content_type.<a href="/src/api/resources/endpoints/content_type/client.rs">post_json_patch_content_with_charset_type</a>(request: ObjectWithOptionalField) -> Result&lt;(), ApiError&gt;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```rust
use seed_exhaustive::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        token: Some("<token>".to_string()),
        ..Default::default()
    };
    let client = ExhaustiveClient::new(config).expect("Failed to build client");
    client
        .endpoints
        .content_type
        .post_json_patch_content_with_charset_type(
            &ObjectWithOptionalField {
                string: Some("string".to_string()),
                integer: Some(1),
                long: Some(1000000),
                double: Some(1.1),
                bool: Some(true),
                datetime: Some(DateTime::parse_from_rfc3339("2024-01-15T09:30:00Z").unwrap()),
                date: Some(NaiveDate::parse_from_str("2023-01-15", "%Y-%m-%d").unwrap()),
                uuid: Some(Uuid::parse_str("d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32").unwrap()),
                base_64: Some(
                    base64::engine::general_purpose::STANDARD
                        .decode("SGVsbG8gd29ybGQh")
                        .unwrap(),
                ),
                list: Some(vec!["list".to_string(), "list".to_string()]),
                set: Some(HashSet::from(["set".to_string()])),
                map: Some(HashMap::from([(1, "map".to_string())])),
                bigint: Some(BigInt::parse_bytes("1000000".as_bytes(), 10).unwrap()),
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

## Endpoints Enum
<details><summary><code>client.endpoints().enum_.<a href="/src/api/resources/endpoints/enum_/client.rs">get_and_return_enum</a>(request: WeatherReport) -> Result&lt;WeatherReport, ApiError&gt;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```rust
use seed_exhaustive::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        token: Some("<token>".to_string()),
        ..Default::default()
    };
    let client = ExhaustiveClient::new(config).expect("Failed to build client");
    client
        .endpoints
        .enum_
        .get_and_return_enum(&WeatherReport::Sunny, None)
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

## Endpoints HttpMethods
<details><summary><code>client.endpoints().http_methods.<a href="/src/api/resources/endpoints/http_methods/client.rs">test_get</a>(id: String) -> Result&lt;String, ApiError&gt;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```rust
use seed_exhaustive::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        token: Some("<token>".to_string()),
        ..Default::default()
    };
    let client = ExhaustiveClient::new(config).expect("Failed to build client");
    client
        .endpoints
        .http_methods
        .test_get(&"id".to_string(), None)
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

<details><summary><code>client.endpoints().http_methods.<a href="/src/api/resources/endpoints/http_methods/client.rs">test_post</a>(request: ObjectWithRequiredField) -> Result&lt;ObjectWithOptionalField, ApiError&gt;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```rust
use seed_exhaustive::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        token: Some("<token>".to_string()),
        ..Default::default()
    };
    let client = ExhaustiveClient::new(config).expect("Failed to build client");
    client
        .endpoints
        .http_methods
        .test_post(
            &ObjectWithRequiredField {
                string: "string".to_string(),
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

<details><summary><code>client.endpoints().http_methods.<a href="/src/api/resources/endpoints/http_methods/client.rs">test_put</a>(id: String, request: ObjectWithRequiredField) -> Result&lt;ObjectWithOptionalField, ApiError&gt;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```rust
use seed_exhaustive::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        token: Some("<token>".to_string()),
        ..Default::default()
    };
    let client = ExhaustiveClient::new(config).expect("Failed to build client");
    client
        .endpoints
        .http_methods
        .test_put(
            &"id".to_string(),
            &ObjectWithRequiredField {
                string: "string".to_string(),
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

<details><summary><code>client.endpoints().http_methods.<a href="/src/api/resources/endpoints/http_methods/client.rs">test_patch</a>(id: String, request: ObjectWithOptionalField) -> Result&lt;ObjectWithOptionalField, ApiError&gt;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```rust
use seed_exhaustive::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        token: Some("<token>".to_string()),
        ..Default::default()
    };
    let client = ExhaustiveClient::new(config).expect("Failed to build client");
    client
        .endpoints
        .http_methods
        .test_patch(
            &"id".to_string(),
            &ObjectWithOptionalField {
                string: Some("string".to_string()),
                integer: Some(1),
                long: Some(1000000),
                double: Some(1.1),
                bool: Some(true),
                datetime: Some(DateTime::parse_from_rfc3339("2024-01-15T09:30:00Z").unwrap()),
                date: Some(NaiveDate::parse_from_str("2023-01-15", "%Y-%m-%d").unwrap()),
                uuid: Some(Uuid::parse_str("d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32").unwrap()),
                base_64: Some(
                    base64::engine::general_purpose::STANDARD
                        .decode("SGVsbG8gd29ybGQh")
                        .unwrap(),
                ),
                list: Some(vec!["list".to_string(), "list".to_string()]),
                set: Some(HashSet::from(["set".to_string()])),
                map: Some(HashMap::from([(1, "map".to_string())])),
                bigint: Some(BigInt::parse_bytes("1000000".as_bytes(), 10).unwrap()),
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

<details><summary><code>client.endpoints().http_methods.<a href="/src/api/resources/endpoints/http_methods/client.rs">test_delete</a>(id: String) -> Result&lt;bool, ApiError&gt;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```rust
use seed_exhaustive::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        token: Some("<token>".to_string()),
        ..Default::default()
    };
    let client = ExhaustiveClient::new(config).expect("Failed to build client");
    client
        .endpoints
        .http_methods
        .test_delete(&"id".to_string(), None)
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

## Endpoints Object
<details><summary><code>client.endpoints().object.<a href="/src/api/resources/endpoints/object/client.rs">get_and_return_with_optional_field</a>(request: ObjectWithOptionalField) -> Result&lt;ObjectWithOptionalField, ApiError&gt;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```rust
use seed_exhaustive::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        token: Some("<token>".to_string()),
        ..Default::default()
    };
    let client = ExhaustiveClient::new(config).expect("Failed to build client");
    client
        .endpoints
        .object
        .get_and_return_with_optional_field(
            &ObjectWithOptionalField {
                string: Some("string".to_string()),
                integer: Some(1),
                long: Some(1000000),
                double: Some(1.1),
                bool: Some(true),
                datetime: Some(DateTime::parse_from_rfc3339("2024-01-15T09:30:00Z").unwrap()),
                date: Some(NaiveDate::parse_from_str("2023-01-15", "%Y-%m-%d").unwrap()),
                uuid: Some(Uuid::parse_str("d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32").unwrap()),
                base_64: Some(
                    base64::engine::general_purpose::STANDARD
                        .decode("SGVsbG8gd29ybGQh")
                        .unwrap(),
                ),
                list: Some(vec!["list".to_string(), "list".to_string()]),
                set: Some(HashSet::from(["set".to_string()])),
                map: Some(HashMap::from([(1, "map".to_string())])),
                bigint: Some(BigInt::parse_bytes("1000000".as_bytes(), 10).unwrap()),
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

<details><summary><code>client.endpoints().object.<a href="/src/api/resources/endpoints/object/client.rs">get_and_return_with_required_field</a>(request: ObjectWithRequiredField) -> Result&lt;ObjectWithRequiredField, ApiError&gt;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```rust
use seed_exhaustive::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        token: Some("<token>".to_string()),
        ..Default::default()
    };
    let client = ExhaustiveClient::new(config).expect("Failed to build client");
    client
        .endpoints
        .object
        .get_and_return_with_required_field(
            &ObjectWithRequiredField {
                string: "string".to_string(),
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

<details><summary><code>client.endpoints().object.<a href="/src/api/resources/endpoints/object/client.rs">get_and_return_with_map_of_map</a>(request: ObjectWithMapOfMap) -> Result&lt;ObjectWithMapOfMap, ApiError&gt;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```rust
use seed_exhaustive::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        token: Some("<token>".to_string()),
        ..Default::default()
    };
    let client = ExhaustiveClient::new(config).expect("Failed to build client");
    client
        .endpoints
        .object
        .get_and_return_with_map_of_map(
            &ObjectWithMapOfMap {
                map: HashMap::from([(
                    "map".to_string(),
                    HashMap::from([("map".to_string(), "map".to_string())]),
                )]),
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

<details><summary><code>client.endpoints().object.<a href="/src/api/resources/endpoints/object/client.rs">get_and_return_nested_with_optional_field</a>(request: NestedObjectWithOptionalField) -> Result&lt;NestedObjectWithOptionalField, ApiError&gt;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```rust
use seed_exhaustive::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        token: Some("<token>".to_string()),
        ..Default::default()
    };
    let client = ExhaustiveClient::new(config).expect("Failed to build client");
    client
        .endpoints
        .object
        .get_and_return_nested_with_optional_field(
            &NestedObjectWithOptionalField {
                string: Some("string".to_string()),
                nested_object: Some(ObjectWithOptionalField {
                    string: Some("string".to_string()),
                    integer: Some(1),
                    long: Some(1000000),
                    double: Some(1.1),
                    bool: Some(true),
                    datetime: Some(DateTime::parse_from_rfc3339("2024-01-15T09:30:00Z").unwrap()),
                    date: Some(NaiveDate::parse_from_str("2023-01-15", "%Y-%m-%d").unwrap()),
                    uuid: Some(Uuid::parse_str("d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32").unwrap()),
                    base_64: Some(
                        base64::engine::general_purpose::STANDARD
                            .decode("SGVsbG8gd29ybGQh")
                            .unwrap(),
                    ),
                    list: Some(vec!["list".to_string(), "list".to_string()]),
                    set: Some(HashSet::from(["set".to_string()])),
                    map: Some(HashMap::from([(1, "map".to_string())])),
                    bigint: Some(BigInt::parse_bytes("1000000".as_bytes(), 10).unwrap()),
                }),
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

<details><summary><code>client.endpoints().object.<a href="/src/api/resources/endpoints/object/client.rs">get_and_return_nested_with_required_field</a>(string: String, request: NestedObjectWithRequiredField) -> Result&lt;NestedObjectWithRequiredField, ApiError&gt;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```rust
use seed_exhaustive::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        token: Some("<token>".to_string()),
        ..Default::default()
    };
    let client = ExhaustiveClient::new(config).expect("Failed to build client");
    client
        .endpoints
        .object
        .get_and_return_nested_with_required_field(
            &"string".to_string(),
            &NestedObjectWithRequiredField {
                string: "string".to_string(),
                nested_object: ObjectWithOptionalField {
                    string: Some("string".to_string()),
                    integer: Some(1),
                    long: Some(1000000),
                    double: Some(1.1),
                    bool: Some(true),
                    datetime: Some(DateTime::parse_from_rfc3339("2024-01-15T09:30:00Z").unwrap()),
                    date: Some(NaiveDate::parse_from_str("2023-01-15", "%Y-%m-%d").unwrap()),
                    uuid: Some(Uuid::parse_str("d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32").unwrap()),
                    base_64: Some(
                        base64::engine::general_purpose::STANDARD
                            .decode("SGVsbG8gd29ybGQh")
                            .unwrap(),
                    ),
                    list: Some(vec!["list".to_string(), "list".to_string()]),
                    set: Some(HashSet::from(["set".to_string()])),
                    map: Some(HashMap::from([(1, "map".to_string())])),
                    bigint: Some(BigInt::parse_bytes("1000000".as_bytes(), 10).unwrap()),
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
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.endpoints().object.<a href="/src/api/resources/endpoints/object/client.rs">get_and_return_nested_with_required_field_as_list</a>(request: Vec&lt;NestedObjectWithRequiredField&gt;) -> Result&lt;NestedObjectWithRequiredField, ApiError&gt;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```rust
use seed_exhaustive::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        token: Some("<token>".to_string()),
        ..Default::default()
    };
    let client = ExhaustiveClient::new(config).expect("Failed to build client");
    client
        .endpoints
        .object
        .get_and_return_nested_with_required_field_as_list(
            &vec![
                NestedObjectWithRequiredField {
                    string: "string".to_string(),
                    nested_object: ObjectWithOptionalField {
                        string: Some("string".to_string()),
                        integer: Some(1),
                        long: Some(1000000),
                        double: Some(1.1),
                        bool: Some(true),
                        datetime: Some(
                            DateTime::parse_from_rfc3339("2024-01-15T09:30:00Z").unwrap(),
                        ),
                        date: Some(NaiveDate::parse_from_str("2023-01-15", "%Y-%m-%d").unwrap()),
                        uuid: Some(
                            Uuid::parse_str("d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32").unwrap(),
                        ),
                        base_64: Some(
                            base64::engine::general_purpose::STANDARD
                                .decode("SGVsbG8gd29ybGQh")
                                .unwrap(),
                        ),
                        list: Some(vec!["list".to_string(), "list".to_string()]),
                        set: Some(HashSet::from(["set".to_string()])),
                        map: Some(HashMap::from([(1, "map".to_string())])),
                        bigint: Some(BigInt::parse_bytes("1000000".as_bytes(), 10).unwrap()),
                    },
                },
                NestedObjectWithRequiredField {
                    string: "string".to_string(),
                    nested_object: ObjectWithOptionalField {
                        string: Some("string".to_string()),
                        integer: Some(1),
                        long: Some(1000000),
                        double: Some(1.1),
                        bool: Some(true),
                        datetime: Some(
                            DateTime::parse_from_rfc3339("2024-01-15T09:30:00Z").unwrap(),
                        ),
                        date: Some(NaiveDate::parse_from_str("2023-01-15", "%Y-%m-%d").unwrap()),
                        uuid: Some(
                            Uuid::parse_str("d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32").unwrap(),
                        ),
                        base_64: Some(
                            base64::engine::general_purpose::STANDARD
                                .decode("SGVsbG8gd29ybGQh")
                                .unwrap(),
                        ),
                        list: Some(vec!["list".to_string(), "list".to_string()]),
                        set: Some(HashSet::from(["set".to_string()])),
                        map: Some(HashMap::from([(1, "map".to_string())])),
                        bigint: Some(BigInt::parse_bytes("1000000".as_bytes(), 10).unwrap()),
                    },
                },
            ],
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

## Endpoints Params
<details><summary><code>client.endpoints().params.<a href="/src/api/resources/endpoints/params/client.rs">get_with_path</a>(param: String) -> Result&lt;String, ApiError&gt;</code></summary>
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
use seed_exhaustive::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        token: Some("<token>".to_string()),
        ..Default::default()
    };
    let client = ExhaustiveClient::new(config).expect("Failed to build client");
    client
        .endpoints
        .params
        .get_with_path(&"param".to_string(), None)
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

<details><summary><code>client.endpoints().params.<a href="/src/api/resources/endpoints/params/client.rs">get_with_inline_path</a>(param: String) -> Result&lt;String, ApiError&gt;</code></summary>
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
use seed_exhaustive::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        token: Some("<token>".to_string()),
        ..Default::default()
    };
    let client = ExhaustiveClient::new(config).expect("Failed to build client");
    client
        .endpoints
        .params
        .get_with_path(&"param".to_string(), None)
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

<details><summary><code>client.endpoints().params.<a href="/src/api/resources/endpoints/params/client.rs">get_with_query</a>(query: Option&lt;String&gt;, number: Option&lt;i64&gt;) -> Result&lt;(), ApiError&gt;</code></summary>
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
use seed_exhaustive::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        token: Some("<token>".to_string()),
        ..Default::default()
    };
    let client = ExhaustiveClient::new(config).expect("Failed to build client");
    client
        .endpoints
        .params
        .get_with_query(
            &GetWithQueryQueryRequest {
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

<details><summary><code>client.endpoints().params.<a href="/src/api/resources/endpoints/params/client.rs">get_with_allow_multiple_query</a>() -> Result&lt;(), ApiError&gt;</code></summary>
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
use seed_exhaustive::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        token: Some("<token>".to_string()),
        ..Default::default()
    };
    let client = ExhaustiveClient::new(config).expect("Failed to build client");
    client
        .endpoints
        .params
        .get_with_query(
            &GetWithQueryQueryRequest {
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

<details><summary><code>client.endpoints().params.<a href="/src/api/resources/endpoints/params/client.rs">get_with_path_and_query</a>(param: String, query: Option&lt;String&gt;) -> Result&lt;(), ApiError&gt;</code></summary>
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
use seed_exhaustive::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        token: Some("<token>".to_string()),
        ..Default::default()
    };
    let client = ExhaustiveClient::new(config).expect("Failed to build client");
    client
        .endpoints
        .params
        .get_with_path_and_query(
            &"param".to_string(),
            &GetWithPathAndQueryQueryRequest {
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

<details><summary><code>client.endpoints().params.<a href="/src/api/resources/endpoints/params/client.rs">get_with_inline_path_and_query</a>(param: String, query: Option&lt;String&gt;) -> Result&lt;(), ApiError&gt;</code></summary>
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
use seed_exhaustive::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        token: Some("<token>".to_string()),
        ..Default::default()
    };
    let client = ExhaustiveClient::new(config).expect("Failed to build client");
    client
        .endpoints
        .params
        .get_with_path_and_query(
            &"param".to_string(),
            &GetWithPathAndQueryQueryRequest {
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

<details><summary><code>client.endpoints().params.<a href="/src/api/resources/endpoints/params/client.rs">modify_with_path</a>(param: String, request: String) -> Result&lt;String, ApiError&gt;</code></summary>
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
use seed_exhaustive::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        token: Some("<token>".to_string()),
        ..Default::default()
    };
    let client = ExhaustiveClient::new(config).expect("Failed to build client");
    client
        .endpoints
        .params
        .modify_with_path(&"param".to_string(), &"string".to_string(), None)
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

<details><summary><code>client.endpoints().params.<a href="/src/api/resources/endpoints/params/client.rs">modify_with_inline_path</a>(param: String, request: String) -> Result&lt;String, ApiError&gt;</code></summary>
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
use seed_exhaustive::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        token: Some("<token>".to_string()),
        ..Default::default()
    };
    let client = ExhaustiveClient::new(config).expect("Failed to build client");
    client
        .endpoints
        .params
        .modify_with_path(&"param".to_string(), &"string".to_string(), None)
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

## Endpoints Primitive
<details><summary><code>client.endpoints().primitive.<a href="/src/api/resources/endpoints/primitive/client.rs">get_and_return_string</a>(request: String) -> Result&lt;String, ApiError&gt;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```rust
use seed_exhaustive::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        token: Some("<token>".to_string()),
        ..Default::default()
    };
    let client = ExhaustiveClient::new(config).expect("Failed to build client");
    client
        .endpoints
        .primitive
        .get_and_return_string(&"string".to_string(), None)
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

<details><summary><code>client.endpoints().primitive.<a href="/src/api/resources/endpoints/primitive/client.rs">get_and_return_int</a>(request: i64) -> Result&lt;i64, ApiError&gt;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```rust
use seed_exhaustive::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        token: Some("<token>".to_string()),
        ..Default::default()
    };
    let client = ExhaustiveClient::new(config).expect("Failed to build client");
    client
        .endpoints
        .primitive
        .get_and_return_int(&1, None)
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

<details><summary><code>client.endpoints().primitive.<a href="/src/api/resources/endpoints/primitive/client.rs">get_and_return_long</a>(request: String) -> Result&lt;String, ApiError&gt;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```rust
use seed_exhaustive::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        token: Some("<token>".to_string()),
        ..Default::default()
    };
    let client = ExhaustiveClient::new(config).expect("Failed to build client");
    client
        .endpoints
        .primitive
        .get_and_return_long(&1000000, None)
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

<details><summary><code>client.endpoints().primitive.<a href="/src/api/resources/endpoints/primitive/client.rs">get_and_return_double</a>(request: f64) -> Result&lt;f64, ApiError&gt;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```rust
use seed_exhaustive::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        token: Some("<token>".to_string()),
        ..Default::default()
    };
    let client = ExhaustiveClient::new(config).expect("Failed to build client");
    client
        .endpoints
        .primitive
        .get_and_return_double(&1.1, None)
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

<details><summary><code>client.endpoints().primitive.<a href="/src/api/resources/endpoints/primitive/client.rs">get_and_return_bool</a>(request: bool) -> Result&lt;bool, ApiError&gt;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```rust
use seed_exhaustive::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        token: Some("<token>".to_string()),
        ..Default::default()
    };
    let client = ExhaustiveClient::new(config).expect("Failed to build client");
    client
        .endpoints
        .primitive
        .get_and_return_bool(&true, None)
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

<details><summary><code>client.endpoints().primitive.<a href="/src/api/resources/endpoints/primitive/client.rs">get_and_return_datetime</a>(request: String) -> Result&lt;String, ApiError&gt;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```rust
use seed_exhaustive::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        token: Some("<token>".to_string()),
        ..Default::default()
    };
    let client = ExhaustiveClient::new(config).expect("Failed to build client");
    client
        .endpoints
        .primitive
        .get_and_return_datetime(
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

<details><summary><code>client.endpoints().primitive.<a href="/src/api/resources/endpoints/primitive/client.rs">get_and_return_date</a>(request: String) -> Result&lt;String, ApiError&gt;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```rust
use seed_exhaustive::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        token: Some("<token>".to_string()),
        ..Default::default()
    };
    let client = ExhaustiveClient::new(config).expect("Failed to build client");
    client
        .endpoints
        .primitive
        .get_and_return_date(
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

<details><summary><code>client.endpoints().primitive.<a href="/src/api/resources/endpoints/primitive/client.rs">get_and_return_uuid</a>(request: String) -> Result&lt;String, ApiError&gt;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```rust
use seed_exhaustive::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        token: Some("<token>".to_string()),
        ..Default::default()
    };
    let client = ExhaustiveClient::new(config).expect("Failed to build client");
    client
        .endpoints
        .primitive
        .get_and_return_uuid(
            &Uuid::parse_str("d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32").unwrap(),
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

<details><summary><code>client.endpoints().primitive.<a href="/src/api/resources/endpoints/primitive/client.rs">get_and_return_base_64</a>(request: String) -> Result&lt;String, ApiError&gt;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```rust
use seed_exhaustive::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        token: Some("<token>".to_string()),
        ..Default::default()
    };
    let client = ExhaustiveClient::new(config).expect("Failed to build client");
    client
        .endpoints
        .primitive
        .get_and_return_base_64(
            &base64::engine::general_purpose::STANDARD
                .decode("SGVsbG8gd29ybGQh")
                .unwrap(),
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

## Endpoints Put
<details><summary><code>client.endpoints().put.<a href="/src/api/resources/endpoints/put/client.rs">add</a>(id: String) -> Result&lt;PutResponse, ApiError&gt;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```rust
use seed_exhaustive::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        token: Some("<token>".to_string()),
        ..Default::default()
    };
    let client = ExhaustiveClient::new(config).expect("Failed to build client");
    client.endpoints.put.add(&"id".to_string(), None).await;
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

## Endpoints Union
<details><summary><code>client.endpoints().union_.<a href="/src/api/resources/endpoints/union_/client.rs">get_and_return_union</a>(request: Animal) -> Result&lt;Animal, ApiError&gt;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```rust
use seed_exhaustive::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        token: Some("<token>".to_string()),
        ..Default::default()
    };
    let client = ExhaustiveClient::new(config).expect("Failed to build client");
    client
        .endpoints
        .union_
        .get_and_return_union(
            &Animal::Dog {
                data: Dog {
                    name: "name".to_string(),
                    likes_to_woof: true,
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

## Endpoints Urls
<details><summary><code>client.endpoints().urls.<a href="/src/api/resources/endpoints/urls/client.rs">with_mixed_case</a>() -> Result&lt;String, ApiError&gt;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```rust
use seed_exhaustive::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        token: Some("<token>".to_string()),
        ..Default::default()
    };
    let client = ExhaustiveClient::new(config).expect("Failed to build client");
    client.endpoints.urls.with_mixed_case(None).await;
}
```
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.endpoints().urls.<a href="/src/api/resources/endpoints/urls/client.rs">no_ending_slash</a>() -> Result&lt;String, ApiError&gt;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```rust
use seed_exhaustive::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        token: Some("<token>".to_string()),
        ..Default::default()
    };
    let client = ExhaustiveClient::new(config).expect("Failed to build client");
    client.endpoints.urls.no_ending_slash(None).await;
}
```
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.endpoints().urls.<a href="/src/api/resources/endpoints/urls/client.rs">with_ending_slash</a>() -> Result&lt;String, ApiError&gt;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```rust
use seed_exhaustive::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        token: Some("<token>".to_string()),
        ..Default::default()
    };
    let client = ExhaustiveClient::new(config).expect("Failed to build client");
    client.endpoints.urls.with_ending_slash(None).await;
}
```
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.endpoints().urls.<a href="/src/api/resources/endpoints/urls/client.rs">with_underscores</a>() -> Result&lt;String, ApiError&gt;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```rust
use seed_exhaustive::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        token: Some("<token>".to_string()),
        ..Default::default()
    };
    let client = ExhaustiveClient::new(config).expect("Failed to build client");
    client.endpoints.urls.with_underscores(None).await;
}
```
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## InlinedRequests
<details><summary><code>client.inlined_requests.<a href="/src/api/resources/inlined_requests/client.rs">post_with_object_bodyand_response</a>(request: PostWithObjectBody) -> Result&lt;ObjectWithOptionalField, ApiError&gt;</code></summary>
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
use seed_exhaustive::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        token: Some("<token>".to_string()),
        ..Default::default()
    };
    let client = ExhaustiveClient::new(config).expect("Failed to build client");
    client
        .inlined_requests
        .post_with_object_bodyand_response(
            &PostWithObjectBody {
                string: "string".to_string(),
                integer: 1,
                nested_object: ObjectWithOptionalField {
                    string: Some("string".to_string()),
                    integer: Some(1),
                    long: Some(1000000),
                    double: Some(1.1),
                    bool: Some(true),
                    datetime: Some(DateTime::parse_from_rfc3339("2024-01-15T09:30:00Z").unwrap()),
                    date: Some(NaiveDate::parse_from_str("2023-01-15", "%Y-%m-%d").unwrap()),
                    uuid: Some(Uuid::parse_str("d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32").unwrap()),
                    base_64: Some(
                        base64::engine::general_purpose::STANDARD
                            .decode("SGVsbG8gd29ybGQh")
                            .unwrap(),
                    ),
                    list: Some(vec!["list".to_string(), "list".to_string()]),
                    set: Some(HashSet::from(["set".to_string()])),
                    map: Some(HashMap::from([(1, "map".to_string())])),
                    bigint: Some(BigInt::parse_bytes("1000000".as_bytes(), 10).unwrap()),
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

**nested_object:** `ObjectWithOptionalField` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## NoAuth
<details><summary><code>client.no_auth.<a href="/src/api/resources/no_auth/client.rs">post_with_no_auth</a>(request: serde_json::Value) -> Result&lt;bool, ApiError&gt;</code></summary>
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
use seed_exhaustive::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        token: Some("<token>".to_string()),
        ..Default::default()
    };
    let client = ExhaustiveClient::new(config).expect("Failed to build client");
    client
        .no_auth
        .post_with_no_auth(&serde_json::json!({"key":"value"}), None)
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

## NoReqBody
<details><summary><code>client.no_req_body.<a href="/src/api/resources/no_req_body/client.rs">get_with_no_request_body</a>() -> Result&lt;ObjectWithOptionalField, ApiError&gt;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```rust
use seed_exhaustive::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        token: Some("<token>".to_string()),
        ..Default::default()
    };
    let client = ExhaustiveClient::new(config).expect("Failed to build client");
    client.no_req_body.get_with_no_request_body(None).await;
}
```
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.no_req_body.<a href="/src/api/resources/no_req_body/client.rs">post_with_no_request_body</a>() -> Result&lt;String, ApiError&gt;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```rust
use seed_exhaustive::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        token: Some("<token>".to_string()),
        ..Default::default()
    };
    let client = ExhaustiveClient::new(config).expect("Failed to build client");
    client.no_req_body.post_with_no_request_body(None).await;
}
```
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## ReqWithHeaders
<details><summary><code>client.req_with_headers.<a href="/src/api/resources/req_with_headers/client.rs">get_with_custom_header</a>(request: String) -> Result&lt;(), ApiError&gt;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```rust
use seed_exhaustive::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        token: Some("<token>".to_string()),
        ..Default::default()
    };
    let client = ExhaustiveClient::new(config).expect("Failed to build client");
    client
        .req_with_headers
        .get_with_custom_header(
            &"string".to_string(),
            Some(
                RequestOptions::new()
                    .additional_header("X-TEST-SERVICE-HEADER", "X-TEST-SERVICE-HEADER")
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
