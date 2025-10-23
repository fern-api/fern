# Reference
<details><summary><code>client.getFoo() -> Foo</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```java
client.getFoo(
    GetFooRequest
        .builder()
        .requiredBaz("required_baz")
        .requiredNullableBaz("required_nullable_baz")
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

**optionalBaz:** `Optional<String>` — An optional baz
    
</dd>
</dl>

<dl>
<dd>

**optionalNullableBaz:** `Optional<String>` — An optional baz
    
</dd>
</dl>

<dl>
<dd>

**requiredBaz:** `String` — A required baz
    
</dd>
</dl>

<dl>
<dd>

**requiredNullableBaz:** `Optional<String>` — A required baz
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.updateFoo(id, request) -> Foo</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```java
client.updateFoo(
    "id",
    UpdateFooRequest
        .builder()
        .xIdempotencyKey("X-Idempotency-Key")
        .nullableText("nullable_text")
        .nullableNumber(1.1)
        .nonNullableText("non_nullable_text")
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

**id:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**xIdempotencyKey:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**nullableText:** `Optional<String>` — Can be explicitly set to null to clear the value
    
</dd>
</dl>

<dl>
<dd>

**nullableNumber:** `Optional<Double>` — Can be explicitly set to null to clear the value
    
</dd>
</dl>

<dl>
<dd>

**nonNullableText:** `Optional<String>` — Regular non-nullable field
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>
