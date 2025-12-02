# Reference
<details><summary><code>$client->create($request) -> Type</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```php
$client->create(
    new CreateRequest([
        'decimal' => 2.2,
        'even' => 100,
        'name' => 'fern',
        'shape' => Shape::Square->value,
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

**$decimal:** `float` 
    
</dd>
</dl>

<dl>
<dd>

**$even:** `int` 
    
</dd>
</dl>

<dl>
<dd>

**$name:** `string` 
    
</dd>
</dl>

<dl>
<dd>

**$shape:** `string` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>$client->get($request) -> Type</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```php
$client->get(
    new GetRequest([
        'decimal' => 2.2,
        'even' => 100,
        'name' => 'fern',
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

**$decimal:** `float` 
    
</dd>
</dl>

<dl>
<dd>

**$even:** `int` 
    
</dd>
</dl>

<dl>
<dd>

**$name:** `string` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>
