# Reference
## User
<details><summary><code>client.user.<a href="/Sources/Resources/User/UserClient.swift">getusername</a>(limit: Int, id: String, date: CalendarDate, deadline: Date, bytes: String, user: User, userList: User?, optionalDeadline: Nullable&lt;Date&gt;?, keyValue: [String: String], optionalString: Nullable&lt;String&gt;?, nestedUser: NestedUser, optionalUser: User?, excludeUser: User?, filter: String?, requestOptions: RequestOptions?) -> User</code></summary>
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

    _ = try await client.user.getusername(
        limit: 1,
        id: "id",
        date: CalendarDate("2023-01-15")!,
        deadline: try! Date("2024-01-15T09:30:00Z", strategy: .iso8601),
        bytes: "bytes",
        user: User(
            name: "name",
            tags: [
                "tags",
                "tags"
            ]
        ),
        optionalDeadline: .value(try! Date("2024-01-15T09:30:00Z", strategy: .iso8601)),
        keyValue: [
            "keyValue": "keyValue"
        ],
        optionalString: .value("optionalString"),
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

**limit:** `Int` 
    
</dd>
</dl>

<dl>
<dd>

**id:** `String` 
    
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

**userList:** `User?` 
    
</dd>
</dl>

<dl>
<dd>

**optionalDeadline:** `Nullable<Date>?` 
    
</dd>
</dl>

<dl>
<dd>

**keyValue:** `[String: String]` 
    
</dd>
</dl>

<dl>
<dd>

**optionalString:** `Nullable<String>?` 
    
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

**excludeUser:** `User?` 
    
</dd>
</dl>

<dl>
<dd>

**filter:** `String?` 
    
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

