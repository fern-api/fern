# Reference
<details><summary><code>$client-&gt;createPlantOrder($plantId, $request) -> PlantOrder</code></summary>
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

```php
$client->createPlantOrder(
    'plantId',
    new CreatePlantOrderRequest([
        'body' => new PlantOrder([
            'orderId' => 'orderId',
            'amount' => 1.1,
            'currency' => 'currency',
            'plantName' => 'plantName',
        ]),
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

**$request:** `PlantOrder` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

