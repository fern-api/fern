# Reference
## User
<details><summary><code>client.user.<a href="/Sources/Resources/User/UserClient.swift">getUsername</a>(limit: Int, id: UUID, date: CalendarDate, deadline: Date, bytes: String, user: User, userList: [User], optionalDeadline: Date?, keyValue: [String: String], optionalString: String?, nestedUser: NestedUser, optionalUser: User?, excludeUser: User, filter: String, requestOptions: RequestOptions?) -> User</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```swift
import Foundation
import QueryParameters

private func main() async throws {
    let client = QueryParametersClient()

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
        excludeUser: ,
        filter: 
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

**requestOptions:** `RequestOptions?` — Additional options for configuring the request, such as custom headers or timeout settings.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>
