# Reference
## Optional
<details><summary><code>client.optional.<a href="/Sources/Resources/Optional/OptionalClient.swift">sendOptionalBody</a>(request: [String: JSONValue]?, requestOptions: RequestOptions?) -> String</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```swift
import Foundation
import ObjectsWithImports

private func main() async throws {
    let client = ObjectsWithImportsClient()

    try await client.optional.sendOptionalBody(request: [
        "string": .object([
            "key": .string("value")
        ])
    ])
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

**request:** `[String: JSONValue]?` 
    
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
