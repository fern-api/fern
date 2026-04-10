# Reference
## 
<details><summary><code>client.<a href="/src/api/resources//client.rs">create</a>(request: CreateRequest) -> Result&lt;Type, ApiError&gt;</code></summary>
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
        ..create(
            &CreateRequest {
                decimal: 1.1,
                even: 1,
                name: "name".to_string(),
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

<details><summary><code>client.<a href="/src/api/resources//client.rs">get</a>(decimal: Option&lt;f64&gt;, even: Option&lt;i64&gt;, name: Option&lt;String&gt;) -> Result&lt;Type, ApiError&gt;</code></summary>
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
        ..get(
            &GetQueryRequest {
                decimal: 1.1,
                even: 1,
                name: "name".to_string(),
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

