# Reference
## Clients
<details><summary><code>client.Clients.Create(request) -> *fern.ClientResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```go
request := &fern.ClientRequest{
        Client: &fern.Client{
            Name: "Acme Corp",
            Email: "contact@acme.com",
        },
    }
client.Clients.Create(
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

**client:** `*fern.Client` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

