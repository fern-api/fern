# Reference
<details><summary><code>client.<a href="/src/SeedApi/SeedApiClient.cs">CreatePlantOrderAsync</a>(CreatePlantOrderRequest { ... }) -> WithRawResponseTask&lt;PlantOrder&gt;</code></summary>
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

```csharp
await client.CreatePlantOrderAsync(
    new CreatePlantOrderRequest
    {
        PlantId = "plantId",
        Body = new PlantOrder
        {
            OrderId = "orderId",
            Amount = 1.1,
            Currency = "currency",
            PlantName = "plantName",
        },
    }
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

**request:** `CreatePlantOrderRequest` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

