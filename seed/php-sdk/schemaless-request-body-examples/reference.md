# Reference
<details><summary><code>$client-&gt;createPlant($request) -> ?CreatePlantResponse</code></summary>
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

```php
$client->createPlant(
    [
        'name' => "Venus Flytrap",
        'species' => "Dionaea muscipula",
        'care' => [
            'light' => "full sun",
            'water' => "distilled only",
            'humidity' => "high",
        ],
        'tags' => [
            "carnivorous",
            "tropical",
        ],
    ],
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

**$request:** `mixed` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>$client-&gt;updatePlant($plantId, $request) -> ?UpdatePlantResponse</code></summary>
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

```php
$client->updatePlant(
    'plantId',
    new UpdatePlantRequest([
        'body' => [
            'name' => "Updated Venus Flytrap",
            'care' => [
                'light' => "partial shade",
            ],
        ],
    ]),
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

**$plantId:** `string` 
    
</dd>
</dl>

<dl>
<dd>

**$request:** `mixed` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>$client-&gt;createPlantWithSchema($request) -> ?CreatePlantWithSchemaResponse</code></summary>
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

```php
$client->createPlantWithSchema(
    new CreatePlantWithSchemaRequest([
        'name' => 'Sundew',
        'species' => 'Drosera capensis',
    ]),
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

**$name:** `?string` 
    
</dd>
</dl>

<dl>
<dd>

**$species:** `?string` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

