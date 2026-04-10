# Reference
## FileUploadExample
<details><summary><code>client.FileUploadExample.UploadFile(request) -> fern.FileID</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Upload a file to the database
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
request := &fern.UploadFileRequest{
        File: strings.NewReader(
            "",
        ),
        Name: "name",
    }
client.FileUploadExample.UploadFile(
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

