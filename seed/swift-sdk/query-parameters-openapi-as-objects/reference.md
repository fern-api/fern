# Reference
<details><summary><code>client.<a href="/Sources/ApiClient.swift">search</a>(limit: Int, id: String, date: String, deadline: Date, bytes: String, user: User, userList: User?, optionalDeadline: Date?, keyValue: [String: String?]?, optionalString: String?, nestedUser: NestedUser?, optionalUser: User?, excludeUser: User?, filter: String?, neighbor: SearchRequestNeighbor?, neighborRequired: SearchRequestNeighborRequired, requestOptions: RequestOptions?) -> SearchResponse</code></summary>
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

    _ = try await client.search(
        limit: 1,
        id: "id",
        date: "date",
        deadline: try! Date("2024-01-15T09:30:00Z", strategy: .iso8601),
        bytes: "bytes",
        user: User(
            name: "name",
            tags: [
                "tags",
                "tags"
            ]
        ),
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
        neighbor: SearchRequestNeighbor.user(
            User(
                name: "name",
                tags: [
                    "tags",
                    "tags"
                ]
            )
        ),
        neighborRequired: SearchRequestNeighborRequired.user(
            User(
                name: "name",
                tags: [
                    "tags",
                    "tags"
                ]
            )
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

**date:** `String` 
    
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

**optionalDeadline:** `Date?` 
    
</dd>
</dl>

<dl>
<dd>

**keyValue:** `[String: String?]?` 
    
</dd>
</dl>

<dl>
<dd>

**optionalString:** `String?` 
    
</dd>
</dl>

<dl>
<dd>

**nestedUser:** `NestedUser?` 
    
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

**neighbor:** `SearchRequestNeighbor?` 
    
</dd>
</dl>

<dl>
<dd>

**neighborRequired:** `SearchRequestNeighborRequired` 
    
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
