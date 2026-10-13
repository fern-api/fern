# Reference
<details><summary><code>client.<a href="/src/client.rs">get</a>(resource_id: serde_json::Value) -> Result&lt;Resource, ApiError&gt;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```rust
use seed_rust_unknown_path_parameter::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        ..Default::default()
    };
    let client = RustUnknownPathParameterClient::new(config).expect("Failed to build client");
    client.get(&serde_json::json!("abc"), None).await;
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

**resource_id:** `serde_json::Value` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.<a href="/src/client.rs">get_by_alias</a>(resource_id: ResourceId) -> Result&lt;Resource, ApiError&gt;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```rust
use seed_rust_unknown_path_parameter::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        ..Default::default()
    };
    let client = RustUnknownPathParameterClient::new(config).expect("Failed to build client");
    client
        .get_by_alias(&ResourceId(serde_json::json!("abc")), None)
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

**resource_id:** `ResourceId` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.<a href="/src/client.rs">get_by_alias_chain</a>(resource_id: ResourceKey) -> Result&lt;Resource, ApiError&gt;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```rust
use seed_rust_unknown_path_parameter::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        ..Default::default()
    };
    let client = RustUnknownPathParameterClient::new(config).expect("Failed to build client");
    client
        .get_by_alias_chain(&ResourceKey(ResourceId(serde_json::json!("abc"))), None)
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

**resource_id:** `ResourceKey` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

