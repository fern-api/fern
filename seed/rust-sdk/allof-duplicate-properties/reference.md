# Reference
<details><summary><code>client.<a href="/src/client.rs">create_plant_order</a>(plant_id: String, request: PlantOrder) -> Result&lt;PlantOrder, ApiError&gt;</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Creates an order for a plant.
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
        ..Default::default()
    };
    let client = ApiClient::new(config).expect("Failed to build client");
    client
        .create_plant_order(
            &"plantId".to_string(),
            &PlantOrder {
                order_base_fields: OrderBase {
                    order_id: "orderId".to_string(),
                    amount: 1.1,
                    currency: "currency".to_string(),
                    date_time: None,
                },
                plant_name: "plantName".to_string(),
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

**plant_id:** `String` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

