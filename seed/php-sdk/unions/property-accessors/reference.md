# Reference
## Bigunion
<details><summary><code>$client->bigunion->get($id) -> BigUnion</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```php
$client->bigunion->get(
    'id',
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

**$id:** `string` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>$client->bigunion->update($request) -> bool</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```php
$client->bigunion->update(
    BigUnion::normalSweet('id', new DateTime('2024-01-15T09:30:00Z'), new DateTime('2024-01-15T09:30:00Z'), new NormalSweet([
        'value' => 'value',
    ])),
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

**$request:** `BigUnion` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>$client->bigunion->updateMany($request) -> array</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```php
$client->bigunion->updateMany(
    [
        BigUnion::normalSweet('id', new DateTime('2024-01-15T09:30:00Z'), new DateTime('2024-01-15T09:30:00Z'), new NormalSweet([
            'value' => 'value',
        ])),
        BigUnion::normalSweet('id', new DateTime('2024-01-15T09:30:00Z'), new DateTime('2024-01-15T09:30:00Z'), new NormalSweet([
            'value' => 'value',
        ])),
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

**$request:** `array` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## Union
<details><summary><code>$client->union->get($id) -> Shape</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```php
$client->bigunion->get(
    'id',
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

**$id:** `string` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>$client->union->update($request) -> bool</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```php
$client->union->update(
    Shape::circle('id', new Circle([
        'radius' => 1.1,
    ])),
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

**$request:** `Shape` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>
