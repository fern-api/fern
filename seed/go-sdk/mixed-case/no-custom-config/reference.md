# Reference
## Service
<details><summary><code>client.Service.GetResource(ResourceID) -> *fern.Resource</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```go
client.Service.GetResource(
        context.TODO(),
        "rsc-xyz",
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

**resourceID:** `string` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.Service.ListResources() -> []*fern.Resource</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```go
request := &fern.ListResourcesRequest{
        PageLimit: 10,
        BeforeDate: fern.MustParseDate(
            "2023-01-01",
        ),
    }
client.Service.ListResources(
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

**pageLimit:** `int` 
    
</dd>
</dl>

<dl>
<dd>

**beforeDate:** `time.Time` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

