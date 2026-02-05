# Reference
## Bigunion
<details><summary><code>client.bigunion.<a href="/src/api/resources/bigunion/client.rs">get</a>(id: String) -> Result&lt;BigUnion, ApiError&gt;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```rust
use seed_unions::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        ..Default::default()
    };
    let client = UnionsClient::new(config).expect("Failed to build client");
    client.bigunion.get(&"id".to_string(), None).await;
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

<details><summary><code>client.bigunion.<a href="/src/api/resources/bigunion/client.rs">update</a>(request: BigUnion) -> Result&lt;bool, ApiError&gt;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```rust
use seed_unions::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        ..Default::default()
    };
    let client = UnionsClient::new(config).expect("Failed to build client");
    client
        .bigunion
        .update(
            &BigUnion::NormalSweet {
                data: NormalSweet {
                    value: "value".to_string(),
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

<details><summary><code>client.bigunion.<a href="/src/api/resources/bigunion/client.rs">update_many</a>(request: Vec&lt;BigUnion&gt;) -> Result&lt;std::collections::HashMap&lt;String, bool&gt;, ApiError&gt;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```rust
use seed_unions::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        ..Default::default()
    };
    let client = UnionsClient::new(config).expect("Failed to build client");
    client
        .bigunion
        .update_many(
            &vec![
                BigUnion::NormalSweet {
                    data: NormalSweet {
                        value: "value".to_string(),
                    },
                },
                BigUnion::NormalSweet {
                    data: NormalSweet {
                        value: "value".to_string(),
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

## Union
<details><summary><code>client.union_.<a href="/src/api/resources/union_/client.rs">get</a>(id: String) -> Result&lt;Shape, ApiError&gt;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```rust
use seed_unions::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        ..Default::default()
    };
    let client = UnionsClient::new(config).expect("Failed to build client");
    client.bigunion.get(&"id".to_string(), None).await;
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

<details><summary><code>client.union_.<a href="/src/api/resources/union_/client.rs">update</a>(request: Shape) -> Result&lt;bool, ApiError&gt;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```rust
use seed_unions::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        ..Default::default()
    };
    let client = UnionsClient::new(config).expect("Failed to build client");
    client
        .union_
        .update(
            &Shape::Circle {
                data: Circle { radius: 1.1 },
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
