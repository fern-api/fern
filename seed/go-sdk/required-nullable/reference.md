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
