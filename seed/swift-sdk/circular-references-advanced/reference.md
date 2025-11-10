# Reference
<details><summary><code>client.<a href="/Sources/ApiClient.swift">testEndpoint</a>(request: ObjectJsonSchemaPropertyInput, requestOptions: RequestOptions?) -> ObjectJsonSchemaPropertyInput</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Test endpoint to ensure types are generated
</dd>
</dl>
</dd>
</dl>

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

    _ = try await client.testEndpoint(request: ObjectJsonSchemaPropertyInput(

    ))
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

**request:** `ObjectJsonSchemaPropertyInput` 
    
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

