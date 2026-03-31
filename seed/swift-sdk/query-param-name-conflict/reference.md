# Reference
<details><summary><code>client.<a href="/Sources/ApiClient.swift">bulkUpdateTasks</a>(filterAssignedTo: Nullable&lt;String&gt;?, filterIsComplete: Nullable&lt;String&gt;?, filterDate: Nullable&lt;String&gt;?, fields: String?, request: Requests.BulkUpdateTasksRequest, requestOptions: RequestOptions?) -> BulkUpdateTasksResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```swift
import Foundation
import Api

private func main() async throws {
    let client = ApiClient()

    _ = try await client.bulkUpdateTasks(request: .init())
}

try await main()
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

**filterAssignedTo:** `Nullable<String>?` 
    
</dd>
</dl>

<dl>
<dd>

**filterIsComplete:** `Nullable<String>?` 
    
</dd>
</dl>

<dl>
<dd>

**filterDate:** `Nullable<String>?` 
    
</dd>
</dl>

<dl>
<dd>

**fields:** `String?` — Comma-separated list of fields to include in the response.
    
</dd>
</dl>

<dl>
<dd>

**request:** `Requests.BulkUpdateTasksRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `RequestOptions?` — Additional options for configuring the request, such as custom headers or timeout settings.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

