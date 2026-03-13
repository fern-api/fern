# Reference
<details><summary><code>client.SubmitFormData(request) -> *fern.PostSubmitResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```go
request := &fern.PostSubmitRequest{
        Username: "johndoe",
        Email: "john@example.com",
    }
client.SubmitFormData(
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

**username:** `string` — The user's username
    
</dd>
</dl>

<dl>
<dd>

**email:** `string` — The user's email address
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

