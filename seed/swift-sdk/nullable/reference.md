# Reference
## Nullable
<details><summary><code>client.nullable.<a href="/Sources/Resources/Nullable/NullableClient_.swift">getUsers</a>(usernames: String?, avatar: String?, activated: Bool?, tags: Nullable<String>?, extra: Nullable<Bool>?, requestOptions: RequestOptions?) -> [User]</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```swift
import Foundation
import Nullable

private func main() async throws {
    let client = NullableClient()

    _ = try await client.nullable.getUsers(
        avatar: "avatar",
        extra: .value(true)
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

**usernames:** `String?` 
    
</dd>
</dl>

<dl>
<dd>

**avatar:** `String?` 
    
</dd>
</dl>

<dl>
<dd>

**activated:** `Bool?` 
    
</dd>
</dl>

<dl>
<dd>

**tags:** `Nullable<String>?` 
    
</dd>
</dl>

<dl>
<dd>

**extra:** `Nullable<Bool>?` 
    
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

<details><summary><code>client.nullable.<a href="/Sources/Resources/Nullable/NullableClient_.swift">createUser</a>(request: Requests.CreateUserRequest, requestOptions: RequestOptions?) -> User</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```swift
import Foundation
import Nullable

private func main() async throws {
    let client = NullableClient()

    _ = try await client.nullable.createUser(request: .init(
        username: "username",
        tags: [
            "tags",
            "tags"
        ],
        metadata: Metadata(
            createdAt: try! Date("2024-01-15T09:30:00Z", strategy: .iso8601),
            updatedAt: try! Date("2024-01-15T09:30:00Z", strategy: .iso8601),
            avatar: .value("avatar"),
            activated: .value(true),
            status: Status.active(
                .init(

                )
            ),
            values: [
                "values": .value("values")
            ]
        ),
        avatar: .value("avatar")
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

<details><summary><code>client.nullable.<a href="/Sources/Resources/Nullable/NullableClient_.swift">deleteUser</a>(request: Requests.DeleteUserRequest, requestOptions: RequestOptions?) -> Bool</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```swift
import Foundation
import Nullable

private func main() async throws {
    let client = NullableClient()

    _ = try await client.nullable.deleteUser(request: .init(username: .value("xy")))
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

**request:** `Requests.DeleteUserRequest` 
    
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
