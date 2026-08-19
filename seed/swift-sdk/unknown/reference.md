# Reference
## Unknown
<details><summary><code>client.unknown.<a href="/Sources/Resources/Unknown/UnknownClient.swift">post</a>(request: JSONValue, requestOptions: RequestOptions?) -> [JSONValue]</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```swift
import Foundation
import UnknownAsAny

private func main() async throws {
    let client = UnknownAsAnyClient()

    _ = try await client.unknown.post(request: .object([
        "key": .string("value")
    ]))
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

**request:** `JSONValue` 
    
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

<details><summary><code>client.unknown.<a href="/Sources/Resources/Unknown/UnknownClient.swift">postObject</a>(request: MyObject, requestOptions: RequestOptions?) -> [JSONValue]</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```swift
import Foundation
import UnknownAsAny

private func main() async throws {
    let client = UnknownAsAnyClient()

    _ = try await client.unknown.postObject(request: MyObject(
        unknown: .object([
            "key": .string("value")
        ])
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

**request:** `MyObject` 
    
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

