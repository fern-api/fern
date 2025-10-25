# Reference
## FileUploadExample
<details><summary><code>client.fileUploadExample.<a href="/Sources/Resources/FileUploadExample/FileUploadExampleClient.swift">uploadFile</a>(request: Requests.UploadFileRequest, requestOptions: RequestOptions?) -> FileId</code></summary>
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

```swift
import Foundation
import Api

private func main() async throws {
    let client = ApiClient()

    _ = try await client.fileUploadExample.uploadFile(request: .init(
        file: .init(data: Data("".utf8)),
        name: "name"
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

**request:** `Requests.UploadFileRequest` 
    
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
