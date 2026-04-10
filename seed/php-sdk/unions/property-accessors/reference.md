# Reference
## Bigunion
<details><summary><code>$client-&gt;bigunion-&gt;get($id) -> BigUnionZero|BigUnionOne|BigUnionTwo|BigUnionThree|BigUnionFour|BigUnionFive|BigUnionSix|BigUnionSeven|BigUnionEight|BigUnionNine|BigUnionTen|BigUnionEleven|BigUnionTwelve|BigUnionThirteen|BigUnionFourteen|BigUnionFifteen|BigUnionSixteen|BigUnionSeventeen|BigUnionEighteen|BigUnionNineteen|BigUnionTwenty|BigUnionTwentyOne|BigUnionTwentyTwo|BigUnionTwentyThree|BigUnionTwentyFour|BigUnionTwentyFive|BigUnionTwentySix|BigUnionTwentySeven|BigUnionTwentyEight|null</code></summary>
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

<details><summary><code>$client-&gt;bigunion-&gt;update($request) -> ?bool</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```php
$client->bigunion->update(
    new BigUnionZero([
        'value' => 'value',
        'type' => BigUnionZeroType::NormalSweet->value,
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

**$request:** `BigUnionZero|BigUnionOne|BigUnionTwo|BigUnionThree|BigUnionFour|BigUnionFive|BigUnionSix|BigUnionSeven|BigUnionEight|BigUnionNine|BigUnionTen|BigUnionEleven|BigUnionTwelve|BigUnionThirteen|BigUnionFourteen|BigUnionFifteen|BigUnionSixteen|BigUnionSeventeen|BigUnionEighteen|BigUnionNineteen|BigUnionTwenty|BigUnionTwentyOne|BigUnionTwentyTwo|BigUnionTwentyThree|BigUnionTwentyFour|BigUnionTwentyFive|BigUnionTwentySix|BigUnionTwentySeven|BigUnionTwentyEight` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>$client-&gt;bigunion-&gt;updateMany($request) -> ?array</code></summary>
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
        new BigUnionZero([
            'value' => 'value',
            'type' => BigUnionZeroType::NormalSweet->value,
        ]),
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
<details><summary><code>$client-&gt;union-&gt;get($id) -> ShapeZero|ShapeOne|null</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```php
$client->union->get(
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

<details><summary><code>$client-&gt;union-&gt;update($request) -> ?bool</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```php
$client->union->update(
    new ShapeZero([
        'radius' => 1.1,
        'type' => ShapeZeroType::Circle->value,
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

**$request:** `ShapeZero|ShapeOne` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

