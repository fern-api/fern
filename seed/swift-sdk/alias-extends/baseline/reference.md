# Reference
<details><summary><code>client.<a href="/Sources/AliasExtendsClient.swift">extendedInlineRequestBody</a>(request: Requests.InlinedChildRequest, requestOptions: RequestOptions?) -> Void</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```swift
import Foundation
import AliasExtends

private func main() async throws {
    let client = AliasExtendsClient()

    _ = try await client.extendedInlineRequestBody(request: .init(
        parent: "parent",
        child: "child"
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

**request:** `Requests.InlinedChildRequest` 
    
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

