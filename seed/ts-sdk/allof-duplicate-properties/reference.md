# Reference
<details><summary><code>client.<a href="/src/Client.ts">createPlantOrder</a>({ ...params }) -> SeedApi.PlantOrder</code></summary>
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

```typescript
await client.createPlantOrder({
    plantId: "plantId",
    body: {
        orderId: "orderId",
        amount: 1.1,
        currency: "currency",
        plantName: "plantName"
    }
});

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

**request:** `SeedApi.CreatePlantOrderRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `SeedApiClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

