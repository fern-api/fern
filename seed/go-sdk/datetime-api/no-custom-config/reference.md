# Reference
## Endpoints
<details><summary><code>client.Endpoints.GetAndReturnWithDatetimeAliasWithDocs(request) -> *fern.ObjectWithDatetimeAlias</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

This endpoint tests that datetime alias fields with intent-specific docs are properly handled.
The dateTime field should preserve its exact value "2023-08-31T14:15:22Z" without being reformatted.
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
request := &fern.ObjectWithDatetimeAlias{
        DateTime: fern.MustParseDateTime(
            "2023-08-31T14:15:22Z",
        ),
        DatetimeAlias: fern.MustParseDateTime(
            "2023-08-31T14:15:22Z",
        ),
    }
client.Endpoints.GetAndReturnWithDatetimeAliasWithDocs(
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

**request:** `*fern.ObjectWithDatetimeAlias` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

