# Reference
<details><summary><code>client.Create(request) -> *fern.Shape</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```go
request := &fern.Shape{
    Circle: &fern.Circle{
        ID: "shape-1",
        CreatedAt: fern.String(
            "2024-01-01T00:00:00Z",
        ),
        Radius: 1.5,
    },
}
client.Create(
    context.TODO(),
    request,
)
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

**request:** `*fern.Shape` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

