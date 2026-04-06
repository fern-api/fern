# Reference
<details><summary><code>client.CreatePlant(request) -> *fern.CreatePlantResponse</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Creates a plant with example JSON but no request body schema.
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
request := map[string]any{
        "care": map[string]any{
            "humidity": "high",
            "light": "full sun",
            "water": "distilled only",
        },
        "name": "Venus Flytrap",
        "species": "Dionaea muscipula",
        "tags": []any{
            "carnivorous",
            "tropical",
        },
    }
client.CreatePlant(
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

**request:** `any` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.UpdatePlant(PlantId, request) -> *fern.UpdatePlantResponse</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Updates a plant with example JSON but no request body schema.
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
request := &fern.UpdatePlantRequest{
        PlantId: "plantId",
        Body: map[string]any{
            "care": map[string]any{
                "light": "partial shade",
            },
            "name": "Updated Venus Flytrap",
        },
    }
client.UpdatePlant(
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

**request:** `any` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.CreatePlantWithSchema(request) -> *fern.CreatePlantWithSchemaResponse</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

A control endpoint that has both schema and example defined.
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
request := &fern.CreatePlantWithSchemaRequest{
        Name: fern.String(
            "Sundew",
        ),
        Species: fern.String(
            "Drosera capensis",
        ),
    }
client.CreatePlantWithSchema(
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

**name:** `*string` 
    
</dd>
</dl>

<dl>
<dd>

**species:** `*string` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

