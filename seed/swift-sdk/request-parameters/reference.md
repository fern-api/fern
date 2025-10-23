# Reference
## User
<details><summary><code>client.user.<a href="/Sources/Resources/User/UserClient.swift">createUsername</a>(tags: [String], request: Requests.CreateUsernameRequest, requestOptions: RequestOptions?) -> Void</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```swift
import Foundation
import RequestParameters

private func main() async throws {
    let client = RequestParametersClient()

    _ = try await client.user.createUsername(
        tags: [
            "tags",
            "tags"
        ],
        request: .init(
            username: "username",
            password: "password",
            name: "test"
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

**tags:** `[String]` 
    
</dd>
</dl>

<dl>
<dd>

**request:** `Requests.CreateUsernameRequest` 
    
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

<details><summary><code>client.user.<a href="/Sources/Resources/User/UserClient.swift">createUsernameWithReferencedType</a>(tags: [String], request: CreateUsernameBody, requestOptions: RequestOptions?) -> Void</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```swift
import Foundation
import RequestParameters

private func main() async throws {
    let client = RequestParametersClient()

    _ = try await client.user.createUsernameWithReferencedType(
        tags: [
            "tags",
            "tags"
        ],
        request: .init(body: CreateUsernameBody(
            username: "username",
            password: "password",
            name: "test"
        ))
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

**tags:** `[String]` 
    
</dd>
</dl>

<dl>
<dd>

**request:** `CreateUsernameBody` 
    
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

<details><summary><code>client.user.<a href="/Sources/Resources/User/UserClient.swift">createUsernameOptional</a>(request: Nullable<CreateUsernameBodyOptionalProperties>?, requestOptions: RequestOptions?) -> Void</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```swift
import Foundation
import RequestParameters

private func main() async throws {
    let client = RequestParametersClient()

    _ = try await client.user.createUsernameOptional(request: .value(CreateUsernameBodyOptionalProperties(

    )))
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

**request:** `Nullable<CreateUsernameBodyOptionalProperties>?` 
    
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

<details><summary><code>client.user.<a href="/Sources/Resources/User/UserClient.swift">getUsername</a>(limit: Int, id: UUID, date: CalendarDate, deadline: Date, bytes: String, user: User, userList: [User], optionalDeadline: Date?, keyValue: [String: String], optionalString: String?, nestedUser: NestedUser, optionalUser: User?, excludeUser: User, filter: String, longParam: Int64, bigIntParam: String, requestOptions: RequestOptions?) -> User</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```swift
import Foundation
import RequestParameters

private func main() async throws {
    let client = RequestParametersClient()

    _ = try await client.user.getUsername(
        limit: 1,
        id: UUID(uuidString: "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32")!,
        date: CalendarDate("2023-01-15")!,
        deadline: try! Date("2024-01-15T09:30:00Z", strategy: .iso8601),
        bytes: "SGVsbG8gd29ybGQh",
        user: User(
            name: "name",
            tags: [
                "tags",
                "tags"
            ]
        ),
        userList: [
            User(
                name: "name",
                tags: [
                    "tags",
                    "tags"
                ]
            ),
            User(
                name: "name",
                tags: [
                    "tags",
                    "tags"
                ]
            )
        ],
        optionalDeadline: try! Date("2024-01-15T09:30:00Z", strategy: .iso8601),
        keyValue: [
            "keyValue": "keyValue"
        ],
        optionalString: "optionalString",
        nestedUser: NestedUser(
            name: "name",
            user: User(
                name: "name",
                tags: [
                    "tags",
                    "tags"
                ]
            )
        ),
        optionalUser: User(
            name: "name",
            tags: [
                "tags",
                "tags"
            ]
        ),
        longParam: 1000000
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

**limit:** `Int` 
    
</dd>
</dl>

<dl>
<dd>

**id:** `UUID` 
    
</dd>
</dl>

<dl>
<dd>

**date:** `CalendarDate` 
    
</dd>
</dl>

<dl>
<dd>

**deadline:** `Date` 
    
</dd>
</dl>

<dl>
<dd>

**bytes:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**user:** `User` 
    
</dd>
</dl>

<dl>
<dd>

**userList:** `[User]` 
    
</dd>
</dl>

<dl>
<dd>

**optionalDeadline:** `Date?` 
    
</dd>
</dl>

<dl>
<dd>

**keyValue:** `[String: String]` 
    
</dd>
</dl>

<dl>
<dd>

**optionalString:** `String?` 
    
</dd>
</dl>

<dl>
<dd>

**nestedUser:** `NestedUser` 
    
</dd>
</dl>

<dl>
<dd>

**optionalUser:** `User?` 
    
</dd>
</dl>

<dl>
<dd>

**excludeUser:** `User` 
    
</dd>
</dl>

<dl>
<dd>

**filter:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**longParam:** `Int64` 
    
</dd>
</dl>

<dl>
<dd>

**bigIntParam:** `String` 
    
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
