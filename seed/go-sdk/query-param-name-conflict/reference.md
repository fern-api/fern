# Reference
<details><summary><code>client.BulkUpdateTasks(request) -> *fern.BulkUpdateTasksResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```go
request := &fern.BulkUpdateTasksRequest{}
client.BulkUpdateTasks(
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

**filterAssignedTo:** `*string` 
    
</dd>
</dl>

<dl>
<dd>

**filterIsComplete:** `*string` 
    
</dd>
</dl>

<dl>
<dd>

**filterDate:** `*string` 
    
</dd>
</dl>

<dl>
<dd>

**fields:** `*string` — Comma-separated list of fields to include in the response.
    
</dd>
</dl>

<dl>
<dd>

**bulkUpdateTasksRequestAssignedTo:** `*string` 
    
</dd>
</dl>

<dl>
<dd>

**bulkUpdateTasksRequestDate:** `*time.Time` 
    
</dd>
</dl>

<dl>
<dd>

**bulkUpdateTasksRequestIsComplete:** `*bool` 
    
</dd>
</dl>

<dl>
<dd>

**text:** `*string` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

