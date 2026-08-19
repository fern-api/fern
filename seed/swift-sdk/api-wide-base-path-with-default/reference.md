# Reference
## Widgets
<details><summary><code>client.widgets.<a href="/Sources/Resources/Widgets/WidgetsClient.swift">create</a>(apiVersion: String, request: Widget, requestOptions: RequestOptions?) -> Widget</code></summary>
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

    _ = try await client.widgets.create(
        apiVersion: "v1beta",
        request: Widget(
            name: "name"
        )
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

**apiVersion:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**request:** `Widget` 
    
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

