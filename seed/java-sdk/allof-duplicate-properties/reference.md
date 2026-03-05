# Reference
<details><summary><code>client.createPlantOrder(plantId, request) -> PlantOrder</code></summary>
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

```java
client.createPlantOrder(
    "plantId",
    CreatePlantOrderRequest
        .builder()
        .body(
            PlantOrder
                .builder()
                .orderId("orderId")
                .amount(1.1)
                .currency("currency")
                .plantName("plantName")
                .build()
        )
        .build()
);
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

**plantId:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**request:** `PlantOrder` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

