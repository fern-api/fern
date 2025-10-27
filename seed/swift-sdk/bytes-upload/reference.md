# Reference
## Service
<details><summary><code>client.service.<a href="/Sources/Resources/Service/ServiceClient.swift">upload</a>(request: Data, requestOptions: RequestOptions?) -> Void</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```swift
import Foundation
import BytesUpload

private func main() async throws {
    let client = BytesUploadClient()

    _ = try await client.service.upload(request: Data("data".utf8))
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

**request:** `Data` 
    
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

