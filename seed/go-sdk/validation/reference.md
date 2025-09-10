# Reference
<details><summary><code>client.Create(request) -> *fern.Type</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```go
client.Create(
        context.TODO(),
        &fern.CreateRequest{
            Decimal: 2.2,
            Even: 100,
            Name: "fern",
            Shape: fern.ShapeSquare,
        },
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

**decimal:** `float64` 
    
</dd>
</dl>

<dl>
<dd>

**even:** `int` 
    
</dd>
</dl>

<dl>
<dd>

**name:** `string` 
    
</dd>
</dl>

<dl>
<dd>

**shape:** `*fern.Shape` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.Get() -> *fern.Type</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```go
client.Get(
        context.TODO(),
        &fern.GetRequest{
            Decimal: 2.2,
            Even: 100,
            Name: "fern",
        },
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

**decimal:** `float64` 
    
</dd>
</dl>

<dl>
<dd>

**even:** `int` 
    
</dd>
</dl>

<dl>
<dd>

**name:** `string` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>
