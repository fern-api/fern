# Reference
## Service
<details><summary><code>client.Service.Getresource(ResourceID) -> *fern.Resource</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```go
request := &fern.ServiceGetResourceRequest{
        ResourceID: "ResourceID",
    }
client.Service.Getresource(
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

**resourceID:** `string` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.Service.Listresources() -> []*fern.Resource</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```go
request := &fern.ServiceListResourcesRequest{
        PageLimit: 1,
        BeforeDate: fern.MustParseDate(
            "2023-01-15",
        ),
    }
client.Service.Listresources(
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

