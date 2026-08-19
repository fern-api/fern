# Reference
<details><summary><code>client.createPlant(request) -> CreatePlantResponse</code></summary>
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

```java
client.createPlant(new 
HashMap<String, Object>() {{put("name", "Venus Flytrap");
    put("species", "Dionaea muscipula");
    put("care", new 
    HashMap<String, Object>() {{put("light", "full sun");
        put("water", "distilled only");
        put("humidity", "high");
    }});
    put("tags", new ArrayList<Object>(Arrays.asList("carnivorous", "tropical")));
}});
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

**request:** `Object` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.updatePlant(plantId, request) -> UpdatePlantResponse</code></summary>
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

```java
client.updatePlant(
    "plantId",
    UpdatePlantRequest
        .builder()
        .body(new 
            HashMap<String, Object>() {{put("name", "Updated Venus Flytrap");
                put("care", new 
                HashMap<String, Object>() {{put("light", "partial shade");
                }});
            }})
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

**request:** `Object` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.createPlantWithSchema(request) -> CreatePlantWithSchemaResponse</code></summary>
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

```java
client.createPlantWithSchema(
    CreatePlantWithSchemaRequest
        .builder()
        .name("Sundew")
        .species("Drosera capensis")
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

**name:** `Optional<String>` 
    
</dd>
</dl>

<dl>
<dd>

**species:** `Optional<String>` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

