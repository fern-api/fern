# Reference
<details><summary><code>client.<a href="/src/client.rs">get_union</a>() -> Result<UnionResponse, ApiError></code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```rust
use seed_undiscriminated_union_with_response_property::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        ..Default::default()
    };
    let client = UndiscriminatedUnionWithResponsePropertyClient::new(config)
        .expect("Failed to build client");
    client.get_union(None).await;
}
```
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.<a href="/src/client.rs">list_unions</a>() -> Result<UnionListResponse, ApiError></code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```rust
use seed_undiscriminated_union_with_response_property::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        ..Default::default()
    };
    let client = UndiscriminatedUnionWithResponsePropertyClient::new(config)
        .expect("Failed to build client");
    client.list_unions(None).await;
}
```
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>
