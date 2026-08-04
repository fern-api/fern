# Reference
## Products
<details><summary><code>client.products.<a href="/src/api/resources/products/client.rs">search</a>(region_id: String, request: SearchProductsRequest) -> Result&lt;SearchProductsResponse, ApiError&gt;</code></summary>
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
        .products
        .search(
            &"regionId".to_string(),
            &SearchProductsRequest {
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

**region_id:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**query:** `Option<String>` 
    
</dd>
</dl>

<dl>
<dd>

**config:** `Option<SearchProductsRequestConfig>` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.products.<a href="/src/api/resources/products/client.rs">get</a>(region_id: String, product_id: String) -> Result&lt;Product, ApiError&gt;</code></summary>
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
        .products
        .get(&"regionId".to_string(), &"productId".to_string(), None)
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

**region_id:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**product_id:** `String` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

