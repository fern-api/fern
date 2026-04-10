# Reference
## User
<details><summary><code>client.user.<a href="/Sources/Resources/User/UserClient.swift">createUser</a>(request: Requests.CreateUserRequest, requestOptions: RequestOptions?) -> User</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```swift
import Foundation
import ExtraProperties

private func main() async throws {
    let client = ExtraPropertiesClient()

    _ = try await client.user.createUser(request: .init(
        type: .createUserRequest,
        version: .v1,
        name: "Alice"
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

**request:** `Requests.CreateUserRequest` 
    
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

