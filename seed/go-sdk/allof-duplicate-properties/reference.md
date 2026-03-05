# Reference
<details><summary><code>client.CreatePlantOrder(PlantId, request) -> *fern.PlantOrder</code></summary>
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

```go
request := &fern.CreatePlantOrderRequest{
        PlantId: "plantId",
        Body: &fern.PlantOrder{
            OrderId: "orderId",
            Amount: 1.1,
            Currency: "currency",
            PlantName: "plantName",
        },
    }
client.CreatePlantOrder(
        context.TODO(),
        request,
    )
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

**plantId:** `string` 
    
</dd>
</dl>

<dl>
<dd>

**request:** `*fern.PlantOrder` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

