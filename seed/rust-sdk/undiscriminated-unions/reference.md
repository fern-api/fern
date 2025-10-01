# Reference
## Union
<details><summary><code>client.union_.<a href="/src/api/resources/union_/client.rs">get</a>(request: MyUnion) -> Result<MyUnion, ApiError></code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```rust
use seed_undiscriminated_unions::{ClientConfig, MyUnion, UndiscriminatedUnionsClient};

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        ..Default::default()
    };
    let client = UndiscriminatedUnionsClient::new(config).expect("Failed to build client");
    client
        .union_
        .get(&MyUnion::String("string".to_string()), None)
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

<details><summary><code>client.union_.<a href="/src/api/resources/union_/client.rs">get_metadata</a>() -> Result<Metadata, ApiError></code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```rust
use seed_undiscriminated_unions::{ClientConfig, UndiscriminatedUnionsClient};

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        ..Default::default()
    };
    let client = UndiscriminatedUnionsClient::new(config).expect("Failed to build client");
    client.union_.get_metadata(None).await;
}
```
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.union_.<a href="/src/api/resources/union_/client.rs">update_metadata</a>(request: MetadataUnion) -> Result<bool, ApiError></code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```rust
use seed_undiscriminated_unions::{
    ClientConfig, MetadataUnion, NamedMetadata, OptionalMetadata, UndiscriminatedUnionsClient,
};
use std::collections::HashMap;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        ..Default::default()
    };
    let client = UndiscriminatedUnionsClient::new(config).expect("Failed to build client");
    client
        .union_
        .update_metadata(
            &MetadataUnion::OptionalMetadata(OptionalMetadata(Some(HashMap::from([(
                "string".to_string(),
                serde_json::json!({"key":"value"}),
            )])))),
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

<details><summary><code>client.union_.<a href="/src/api/resources/union_/client.rs">call</a>(request: Request) -> Result<bool, ApiError></code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```rust
use seed_undiscriminated_unions::{
    ClientConfig, MetadataUnion, NamedMetadata, OptionalMetadata, Request,
    UndiscriminatedUnionsClient,
};
use std::collections::HashMap;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        ..Default::default()
    };
    let client = UndiscriminatedUnionsClient::new(config).expect("Failed to build client");
    client
        .union_
        .call(
            &Request {
                union: Some(MetadataUnion::OptionalMetadata(OptionalMetadata(Some(
                    HashMap::from([("string".to_string(), serde_json::json!({"key":"value"}))]),
                )))),
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

<details><summary><code>client.union_.<a href="/src/api/resources/union_/client.rs">duplicate_types_union</a>(request: UnionWithDuplicateTypes) -> Result<UnionWithDuplicateTypes, ApiError></code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```rust
use seed_undiscriminated_unions::{
    ClientConfig, UndiscriminatedUnionsClient, UnionWithDuplicateTypes,
};

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        ..Default::default()
    };
    let client = UndiscriminatedUnionsClient::new(config).expect("Failed to build client");
    client
        .union_
        .duplicate_types_union(&UnionWithDuplicateTypes::String("string".to_string()), None)
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

<details><summary><code>client.union_.<a href="/src/api/resources/union_/client.rs">nested_unions</a>(request: NestedUnionRoot) -> Result<String, ApiError></code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```rust
use seed_undiscriminated_unions::{
    ClientConfig, NestedUnionL1, NestedUnionL2, NestedUnionRoot, UndiscriminatedUnionsClient,
};

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        ..Default::default()
    };
    let client = UndiscriminatedUnionsClient::new(config).expect("Failed to build client");
    client
        .union_
        .nested_unions(&NestedUnionRoot::String("string".to_string()), None)
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
