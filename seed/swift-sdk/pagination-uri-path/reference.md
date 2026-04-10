# Reference
## Users
<details><summary><code>client.users.<a href="/Sources/Resources/Users/UsersClient.swift">listWithUriPagination</a>(requestOptions: RequestOptions?) -> ListUsersUriPaginationResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```swift
import Foundation
import PaginationUriPath

private func main() async throws {
    let client = PaginationUriPathClient(token: "<token>")

    _ = try await client.users.listWithUriPagination()
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

**requestOptions:** `RequestOptions?` — Additional options for configuring the request, such as custom headers or timeout settings.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.users.<a href="/Sources/Resources/Users/UsersClient.swift">listWithPathPagination</a>(requestOptions: RequestOptions?) -> ListUsersPathPaginationResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```swift
import Foundation
import PaginationUriPath

private func main() async throws {
    let client = PaginationUriPathClient(token: "<token>")

    _ = try await client.users.listWithPathPagination()
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

**requestOptions:** `RequestOptions?` — Additional options for configuring the request, such as custom headers or timeout settings.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

