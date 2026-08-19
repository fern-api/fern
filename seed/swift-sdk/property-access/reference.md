# Reference
<details><summary><code>client.<a href="/Sources/PropertyAccessClient.swift">createUser</a>(request: User, requestOptions: RequestOptions?) -> User</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```swift
import Foundation
import PropertyAccess

private func main() async throws {
    let client = PropertyAccessClient()

    _ = try await client.createUser(request: User(
        id: "id",
        email: "email",
        password: "password",
        profile: UserProfile(
            name: "name",
            verification: UserProfileVerification(
                verified: "verified"
            ),
            ssn: "ssn"
        )
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

**request:** `User` 
    
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

