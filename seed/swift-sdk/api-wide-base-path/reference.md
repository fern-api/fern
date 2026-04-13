# Reference
## Service
<details><summary><code>client.service.<a href="/Sources/Resources/Service/ServiceClient.swift">post</a>(pathParam: String, serviceParam: String, endpointParam: String, resourceParam: String, requestOptions: RequestOptions?) -> Void</code></summary>
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

    _ = try await client.service.post(
        pathParam: "pathParam",
        serviceParam: "serviceParam",
        endpointParam: 1,
        resourceParam: "resourceParam"
    )
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

**pathParam:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**serviceParam:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**endpointParam:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**resourceParam:** `String` 
    
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

