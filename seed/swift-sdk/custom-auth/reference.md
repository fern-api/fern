# Reference
## CustomAuth
<details><summary><code>client.customAuth.<a href="/Sources/Resources/CustomAuth/CustomAuthClient_.swift">getWithCustomAuth</a>(requestOptions: RequestOptions?) -> Bool</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

GET request with custom auth scheme
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
import CustomAuth

private func main() async throws {
    let client = CustomAuthClient(customAuthScheme: "<value>")

    _ = try await client.customAuth.getWithCustomAuth()
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

**requestOptions:** `RequestOptions?` — Additional options for configuring the request, such as custom headers or timeout settings.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.customAuth.<a href="/Sources/Resources/CustomAuth/CustomAuthClient_.swift">postWithCustomAuth</a>(request: JSONValue, requestOptions: RequestOptions?) -> Bool</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

POST request with custom auth scheme
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
import CustomAuth

private func main() async throws {
    let client = CustomAuthClient(customAuthScheme: "<value>")

    _ = try await client.customAuth.postWithCustomAuth(request: .object([
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

