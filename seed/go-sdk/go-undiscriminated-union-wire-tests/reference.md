# Reference
## Service
<details><summary><code>client.Service.Rerank(request) -> *fern.RerankResponse</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Rerank documents based on relevance to a query
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
request := &fern.RerankRequest{
        Documents: []*fern.DocumentItem{
            &fern.DocumentItem{
                String: "documents",
            },
        },
        Query: "query",
    }
client.Service.Rerank(
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

**documents:** `[]*fern.DocumentItem` 
    
</dd>
</dl>

<dl>
<dd>

**query:** `string` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

