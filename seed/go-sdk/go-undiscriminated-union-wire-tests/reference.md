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
                DocumentObject: &fern.DocumentObject{
                    Text: "Carson City is the capital city of the American state of Nevada.",
                },
            },
            &fern.DocumentItem{
                DocumentObject: &fern.DocumentObject{
                    Text: "Washington, D.C. is the capital of the United States.",
                },
            },
        },
        Query: "What is the capital of the United States?",
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

**request:** `*fern.RerankRequest` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>
