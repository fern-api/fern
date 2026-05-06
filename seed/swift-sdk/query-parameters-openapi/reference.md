# Reference
<details><summary><code>client.<a href="/Sources/ApiClient.swift">search</a>(limit: Int, id: String, date: CalendarDate, deadline: Date, bytes: String, user: User, userList: Nullable&lt;User&gt;?, optionalDeadline: Nullable&lt;Date&gt;?, keyValue: Nullable&lt;[String: Nullable&lt;String&gt;]&gt;?, optionalString: Nullable&lt;String&gt;?, nestedUser: Nullable&lt;NestedUser&gt;?, optionalUser: Nullable&lt;User&gt;?, excludeUser: Nullable&lt;User&gt;?, filter: Nullable&lt;String&gt;?, tags: Nullable&lt;String&gt;?, optionalTags: Nullable&lt;String&gt;?, neighbor: Nullable&lt;SearchRequestNeighbor&gt;?, neighborRequired: User, requestOptions: RequestOptions?) -> SearchResponse</code></summary>
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
        date: CalendarDate("2023-01-15")!,
        deadline: try! Date("2024-01-15T09:30:00Z", strategy: .iso8601),
        bytes: "bytes",
        user: User(
            name: .value("name"),
            tags: .value([
                "tags",
                "tags"
            ])
        ),
        optionalDeadline: .value(try! Date("2024-01-15T09:30:00Z", strategy: .iso8601)),
        keyValue: .value([
            "keyValue": .value("keyValue")
        ]),
        optionalString: .value("optionalString"),
        nestedUser: .value(NestedUser(
            name: .value("name"),
            user: .value(User(
                name: .value("name"),
                tags: .value([
                    "tags",
                    "tags"
                ])
            ))
        )),
        optionalUser: .value(User(
            name: .value("name"),
            tags: .value([
                "tags",
                "tags"
            ])
        )),
        neighbor: .value(SearchRequestNeighbor.user(
            User(
                name: .value("name"),
                tags: .value([
                    "tags",
                    "tags"
                ])
            )
        )),
        neighborRequired: User(
            name: .value("name"),
            tags: .value([
                "tags",
                "tags"
            ])
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

**userList:** `Nullable<User>?` 
    
</dd>
</dl>

<dl>
<dd>

**optionalDeadline:** `Nullable<Date>?` 
    
</dd>
</dl>

<dl>
<dd>

**keyValue:** `Nullable<[String: Nullable<String>]>?` 
    
</dd>
</dl>

<dl>
<dd>

**optionalString:** `Nullable<String>?` 
    
</dd>
</dl>

<dl>
<dd>

**nestedUser:** `Nullable<NestedUser>?` 
    
</dd>
</dl>

<dl>
<dd>

**optionalUser:** `Nullable<User>?` 
    
</dd>
</dl>

<dl>
<dd>

**excludeUser:** `Nullable<User>?` 
    
</dd>
</dl>

<dl>
<dd>

**filter:** `Nullable<String>?` 
    
</dd>
</dl>

<dl>
<dd>

**tags:** `Nullable<String>?` — List of tags. Serialized as a comma-separated list.
    
</dd>
</dl>

<dl>
<dd>

**optionalTags:** `Nullable<String>?` — Optional list of tags. Serialized as a comma-separated list.
    
</dd>
</dl>

<dl>
<dd>

**neighbor:** `Nullable<SearchRequestNeighbor>?` 
    
</dd>
</dl>

<dl>
<dd>

**neighborRequired:** `User` 
    
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

