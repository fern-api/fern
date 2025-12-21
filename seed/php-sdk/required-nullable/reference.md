# Reference
<details><summary><code>$client->getFoo($request) -> Foo</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```php
$client->getFoo(
    new GetFooRequest([
        'requiredBaz' => 'required_baz',
        'requiredNullableBaz' => 'required_nullable_baz',
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

**$optionalBaz:** `?string` — An optional baz
    
</dd>
</dl>

<dl>
<dd>

**$optionalNullableBaz:** `?string` — An optional baz
    
</dd>
</dl>

<dl>
<dd>

**$requiredBaz:** `string` — A required baz
    
</dd>
</dl>

<dl>
<dd>

**$requiredNullableBaz:** `?string` — A required baz
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>$client->updateFoo($id, $request) -> Foo</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```php
$client->updateFoo(
    'id',
    new UpdateFooRequest([
        'xIdempotencyKey' => 'X-Idempotency-Key',
        'nullableText' => 'nullable_text',
        'nullableNumber' => 1.1,
        'nonNullableText' => 'non_nullable_text',
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

**$id:** `string` 
    
</dd>
</dl>

<dl>
<dd>

**$xIdempotencyKey:** `string` 
    
</dd>
</dl>

<dl>
<dd>

**$nullableText:** `?string` — Can be explicitly set to null to clear the value
    
</dd>
</dl>

<dl>
<dd>

**$nullableNumber:** `?float` — Can be explicitly set to null to clear the value
    
</dd>
</dl>

<dl>
<dd>

**$nonNullableText:** `?string` — Regular non-nullable field
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>
