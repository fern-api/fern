# Reference
<details><summary><code>client.<a href="/Sources/ExtendsClient.swift">extendedInlineRequestBody</a>(request: Requests.Inlined, requestOptions: RequestOptions?) -> Void</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```swift
import Foundation
import Extends

private func main() async throws {
    let client = ExtendsClient()

    _ = try await client.extendedInlineRequestBody(request: .init(
        name: "name",
        docs: "docs",
        unique: "unique"
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

**request:** `Requests.Inlined` 
    
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

