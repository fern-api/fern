# Reference
## 
<details><summary><code>client..<a href="/Sources/Resources//Client.swift">create</a>(request: Requests.CreateRequest, requestOptions: RequestOptions?) -> Type</code></summary>
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

    _ = try await client..create(request: .init(
        decimal: 1.1,
        even: 1,
        name: "name",
        shape: .square
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

**request:** `Requests.CreateRequest` 
    
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

<details><summary><code>client..<a href="/Sources/Resources//Client.swift">get</a>(decimal: Swift.Double, even: Int, name: String, requestOptions: RequestOptions?) -> Type</code></summary>
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

    _ = try await client..get(
        decimal: 1.1,
        even: 1,
        name: "name"
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

**decimal:** `Swift.Double` 
    
</dd>
</dl>

<dl>
<dd>

**even:** `Int` 
    
</dd>
</dl>

<dl>
<dd>

**name:** `String` 
    
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

