# Reference
## Service
<details><summary><code>client.Service.Upload(request) -> error</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```go
client.Service.Upload(
        context.TODO(),
        request,
    )
}
```
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.Service.UploadWithQueryParams(request) -> error</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```go
request := &fern.UploadWithQueryParamsRequest{
        Model: "nova-2",
        Body: bytes.NewReader(
            []byte(""),
        ),
    }
client.Service.UploadWithQueryParams(
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

**model:** `string` — The model to use for processing
    
</dd>
</dl>

<dl>
<dd>

**language:** `*string` — The language of the content
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

