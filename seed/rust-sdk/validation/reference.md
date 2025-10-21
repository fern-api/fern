# Reference
<details><summary><code>client.<a href="/src/client.rs">create</a>(request: CreateRequest) -> Result<Type, ApiError></code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```rust
use seed_validation::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        ..Default::default()
    };
    let client = ValidationClient::new(config).expect("Failed to build client");
    client
        .create(
            &CreateRequest {
                decimal: 2.2,
                even: 100,
                name: "fern".to_string(),
                shape: Shape::Square,
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

**decimal:** `f64` 
    
</dd>
</dl>

<dl>
<dd>

**even:** `i64` 
    
</dd>
</dl>

<dl>
<dd>

**name:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**shape:** `Shape` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.<a href="/src/client.rs">get</a>(decimal: Option<f64>, even: Option<i64>, name: Option<String>) -> Result<Type, ApiError></code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```rust
use seed_validation::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        ..Default::default()
    };
    let client = ValidationClient::new(config).expect("Failed to build client");
    client
        .get(
            &GetQueryRequest {
                decimal: 2.2,
                even: 100,
                name: "fern".to_string(),
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

**decimal:** `f64` 
    
</dd>
</dl>

<dl>
<dd>

**even:** `i64` 
    
</dd>
</dl>

<dl>
<dd>

**name:** `String` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>
