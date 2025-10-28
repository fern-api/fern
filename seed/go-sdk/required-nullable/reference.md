# Reference
<details><summary><code>client.GetFoo() -> *fern.Foo</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```go
request := &fern.GetFooRequest{
        RequiredBaz: "required_baz",
        RequiredNullableBaz: fern.String(
            "required_nullable_baz",
        ),
    }
client.GetFoo(
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

**optionalBaz:** `*string` — An optional baz
    
</dd>
</dl>

<dl>
<dd>

**optionalNullableBaz:** `*string` — An optional baz
    
</dd>
</dl>

<dl>
<dd>

**requiredBaz:** `string` — A required baz
    
</dd>
</dl>

<dl>
<dd>

**requiredNullableBaz:** `*string` — A required baz
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.UpdateFoo(Id, request) -> *fern.Foo</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```go
request := &fern.UpdateFooRequest{
        XIdempotencyKey: "X-Idempotency-Key",
        NullableText: fern.String(
            "nullable_text",
        ),
        NullableNumber: fern.Float64(
            1.1,
        ),
        NonNullableText: fern.String(
            "non_nullable_text",
        ),
    }
client.UpdateFoo(
        context.TODO(),
        "id",
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

**id:** `string` 
    
</dd>
</dl>

<dl>
<dd>

**xIdempotencyKey:** `string` 
    
</dd>
</dl>

<dl>
<dd>

**nullableText:** `*string` — Can be explicitly set to null to clear the value
    
</dd>
</dl>

<dl>
<dd>

**nullableNumber:** `*float64` — Can be explicitly set to null to clear the value
    
</dd>
</dl>

<dl>
<dd>

**nonNullableText:** `*string` — Regular non-nullable field
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>
