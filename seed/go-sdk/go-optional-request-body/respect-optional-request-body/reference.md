# Reference
<details><summary><code>client.WaterPlant(PlantID, request) -> *fern.Watering</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Water a plant, optionally with a specific amount.
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
request := &fern.WaterPlantRequest{
    PlantID: "plant-id",
    Body: &fern.WateringRequest{
        Milliliters: fern.Float64(
            60,
        ),
    },
}
client.WaterPlant(
    context.TODO(),
    request,
)
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

**plantID:** `string` 
    
</dd>
</dl>

<dl>
<dd>

**request:** `*fern.WateringRequest` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.WaterAllPlants(request) -> []*fern.Watering</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Water every plant, optionally with a specific amount.
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
request := &fern.WateringRequest{
    Milliliters: fern.Float64(
        1.1,
    ),
}
client.WaterAllPlants(
    context.TODO(),
    request,
)
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

**request:** `*fern.WateringRequest` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.PrunePlant(PlantID, request) -> *fern.Watering</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Prune a plant, always with an amount.
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
request := &fern.PrunePlantRequest{
    PlantID: "plant-id",
    Body: &fern.WateringRequest{
        Milliliters: fern.Float64(
            60,
        ),
    },
}
client.PrunePlant(
    context.TODO(),
    request,
)
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

**plantID:** `string` 
    
</dd>
</dl>

<dl>
<dd>

**request:** `*fern.WateringRequest` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.MistPlant(PlantID, request) -> *fern.Watering</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Mist a plant, passing the body alongside a header.
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
request := &fern.MistPlantRequest{
    PlantID: "plantId",
    IdempotencyKey: fern.String(
        "idempotencyKey",
    ),
    Body: &fern.WateringRequest{
        Milliliters: fern.Float64(
            1.1,
        ),
    },
}
client.MistPlant(
    context.TODO(),
    request,
)
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

**plantID:** `string` 
    
</dd>
</dl>

<dl>
<dd>

**idempotencyKey:** `*string` 
    
</dd>
</dl>

<dl>
<dd>

**request:** `*fern.WateringRequest` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

