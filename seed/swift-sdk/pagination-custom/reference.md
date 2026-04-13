# Reference
## Users
<details><summary><code>client.users.<a href="/Sources/Resources/Users/UsersClient.swift">listwithcustompager</a>(limit: Nullable&lt;Int&gt;?, startingAfter: Nullable&lt;String&gt;?, requestOptions: RequestOptions?) -> UsersListResponse</code></summary>
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
    let client = ApiClient(token: "<token>")

    _ = try await client.users.listwithcustompager()
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

**limit:** `Nullable<Int>?` — The maximum number of results to return.
    
</dd>
</dl>

<dl>
<dd>

**startingAfter:** `Nullable<String>?` — The cursor used for pagination.
    
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

