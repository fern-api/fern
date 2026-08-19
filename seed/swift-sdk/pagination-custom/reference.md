# Reference
## Users
<details><summary><code>client.users.<a href="/Sources/Resources/Users/UsersClient.swift">listWithCustomPager</a>(limit: Int?, startingAfter: String?, requestOptions: RequestOptions?) -> UsersListResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```swift
import Foundation
import Pagination

private func main() async throws {
    let client = PaginationClient(token: "<token>")

    _ = try await client.users.listWithCustomPager(
        limit: 1,
        startingAfter: "starting_after"
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

**limit:** `Int?` — The maximum number of results to return.
    
</dd>
</dl>

<dl>
<dd>

**startingAfter:** `String?` — The cursor used for pagination.
    
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

