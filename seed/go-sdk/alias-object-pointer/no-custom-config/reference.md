# Reference
<details><summary><code>client.Create(request) -> error</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Creates a resource with alias-typed fields.
</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```go
request := &fern.CreateRequest{
        MapField: func() *fern.StringMap { v := fern.StringMap(
            map[string]string{
                "key": "value",
            },
        ); return &v }(),
        ListField: func() *fern.StringList { v := fern.StringList(
            []string{
                "test",
            },
        ); return &v }(),
    }
client.Create(
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

**request:** `*fern.CreateRequest` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>
