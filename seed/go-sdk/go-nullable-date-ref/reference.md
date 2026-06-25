# Reference
## Reports
<details><summary><code>client.Reports.Create(request) -> *fern.Report</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```go
request := &fern.Report{
        CreatedDate: fern.MustParseDate(
            "2023-01-15",
        ),
        Title: "title",
    }
client.Reports.Create(
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

**request:** `*fern.Report` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

