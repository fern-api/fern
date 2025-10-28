# Reference
## Conversations
<details><summary><code>client.complex.<a href="/Sources/Resources/Complex/ComplexClient.swift">search</a>(index: String, request: SearchRequest, requestOptions: RequestOptions?) -> PaginatedConversationResponse</code></summary>
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

    _ = try await client.complex.search(
        index: "index",
        request: SearchRequest(
            pagination: StartingAfterPaging(
                perPage: 1,
                startingAfter: "starting_after"
            ),
            query: SearchRequestQuery.singleFilterSearchRequest(
                SingleFilterSearchRequest(
                    field: "field",
                    operator: .equals,
                    value: "value"
                )
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

**index:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**request:** `SearchRequest` 
    
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

## InlineUsers InlineUsers
<details><summary><code>client.inlineUsers.inlineUsers.<a href="/Sources/Resources/InlineUsers/InlineUsers/InlineUsersInlineUsersClient.swift">listWithCursorPagination</a>(page: Int?, perPage: Int?, order: Order?, startingAfter: String?, requestOptions: RequestOptions?) -> ListUsersPaginationResponse</code></summary>
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

    _ = try await client.inlineUsers.inlineUsers.listWithCursorPagination(
        page: 1,
        perPage: 1,
        order: .asc,
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

**page:** `Int?` — Defaults to first page
    
</dd>
</dl>

<dl>
<dd>

**perPage:** `Int?` — Defaults to per page
    
</dd>
</dl>

<dl>
<dd>

**order:** `Order?` 
    
</dd>
</dl>

<dl>
<dd>

**startingAfter:** `String?` 

The cursor used for pagination in order to fetch
the next page of results.
    
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

<details><summary><code>client.inlineUsers.inlineUsers.<a href="/Sources/Resources/InlineUsers/InlineUsers/InlineUsersInlineUsersClient.swift">listWithMixedTypeCursorPagination</a>(cursor: String?, requestOptions: RequestOptions?) -> ListUsersMixedTypePaginationResponse</code></summary>
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

    _ = try await client.inlineUsers.inlineUsers.listWithMixedTypeCursorPagination(cursor: "cursor")
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

**cursor:** `String?` 
    
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

<details><summary><code>client.inlineUsers.inlineUsers.<a href="/Sources/Resources/InlineUsers/InlineUsers/InlineUsersInlineUsersClient.swift">listWithBodyCursorPagination</a>(request: Requests.ListUsersBodyCursorPaginationRequest, requestOptions: RequestOptions?) -> ListUsersPaginationResponse</code></summary>
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

    _ = try await client.inlineUsers.inlineUsers.listWithMixedTypeCursorPagination()
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

**request:** `Requests.ListUsersBodyCursorPaginationRequest` 
    
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

<details><summary><code>client.inlineUsers.inlineUsers.<a href="/Sources/Resources/InlineUsers/InlineUsers/InlineUsersInlineUsersClient.swift">listWithOffsetPagination</a>(page: Int?, perPage: Int?, order: Order?, startingAfter: String?, requestOptions: RequestOptions?) -> ListUsersPaginationResponse</code></summary>
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

    _ = try await client.inlineUsers.inlineUsers.listWithCursorPagination(
        page: 1,
        perPage: 1,
        order: .asc,
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

**page:** `Int?` — Defaults to first page
    
</dd>
</dl>

<dl>
<dd>

**perPage:** `Int?` — Defaults to per page
    
</dd>
</dl>

<dl>
<dd>

**order:** `Order?` 
    
</dd>
</dl>

<dl>
<dd>

**startingAfter:** `String?` 

The cursor used for pagination in order to fetch
the next page of results.
    
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

<details><summary><code>client.inlineUsers.inlineUsers.<a href="/Sources/Resources/InlineUsers/InlineUsers/InlineUsersInlineUsersClient.swift">listWithDoubleOffsetPagination</a>(page: Double?, perPage: Double?, order: Order?, startingAfter: String?, requestOptions: RequestOptions?) -> ListUsersPaginationResponse</code></summary>
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

    _ = try await client.inlineUsers.inlineUsers.listWithCursorPagination(
        page: 1.1,
        perPage: 1.1,
        order: .asc,
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

**page:** `Double?` — Defaults to first page
    
</dd>
</dl>

<dl>
<dd>

**perPage:** `Double?` — Defaults to per page
    
</dd>
</dl>

<dl>
<dd>

**order:** `Order?` 
    
</dd>
</dl>

<dl>
<dd>

**startingAfter:** `String?` 

The cursor used for pagination in order to fetch
the next page of results.
    
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

<details><summary><code>client.inlineUsers.inlineUsers.<a href="/Sources/Resources/InlineUsers/InlineUsers/InlineUsersInlineUsersClient.swift">listWithBodyOffsetPagination</a>(request: Requests.ListUsersBodyOffsetPaginationRequest, requestOptions: RequestOptions?) -> ListUsersPaginationResponse</code></summary>
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

    _ = try await client.inlineUsers.inlineUsers.listWithMixedTypeCursorPagination()
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

**request:** `Requests.ListUsersBodyOffsetPaginationRequest` 
    
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

<details><summary><code>client.inlineUsers.inlineUsers.<a href="/Sources/Resources/InlineUsers/InlineUsers/InlineUsersInlineUsersClient.swift">listWithOffsetStepPagination</a>(page: Int?, limit: Int?, order: Order?, requestOptions: RequestOptions?) -> ListUsersPaginationResponse</code></summary>
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

    _ = try await client.inlineUsers.inlineUsers.listWithCursorPagination(
        page: 1,
        order: .asc
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

**page:** `Int?` — Defaults to first page
    
</dd>
</dl>

<dl>
<dd>

**limit:** `Int?` 

The maximum number of elements to return.
This is also used as the step size in this
paginated endpoint.
    
</dd>
</dl>

<dl>
<dd>

**order:** `Order?` 
    
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

<details><summary><code>client.inlineUsers.inlineUsers.<a href="/Sources/Resources/InlineUsers/InlineUsers/InlineUsersInlineUsersClient.swift">listWithOffsetPaginationHasNextPage</a>(page: Int?, limit: Int?, order: Order?, requestOptions: RequestOptions?) -> ListUsersPaginationResponse</code></summary>
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

    _ = try await client.inlineUsers.inlineUsers.listWithCursorPagination(
        page: 1,
        order: .asc
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

**page:** `Int?` — Defaults to first page
    
</dd>
</dl>

<dl>
<dd>

**limit:** `Int?` 

The maximum number of elements to return.
This is also used as the step size in this
paginated endpoint.
    
</dd>
</dl>

<dl>
<dd>

**order:** `Order?` 
    
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

<details><summary><code>client.inlineUsers.inlineUsers.<a href="/Sources/Resources/InlineUsers/InlineUsers/InlineUsersInlineUsersClient.swift">listWithExtendedResults</a>(cursor: UUID?, requestOptions: RequestOptions?) -> ListUsersExtendedResponse</code></summary>
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

    _ = try await client.inlineUsers.inlineUsers.listWithCursorPagination()
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

**cursor:** `UUID?` 
    
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

<details><summary><code>client.inlineUsers.inlineUsers.<a href="/Sources/Resources/InlineUsers/InlineUsers/InlineUsersInlineUsersClient.swift">listWithExtendedResultsAndOptionalData</a>(cursor: UUID?, requestOptions: RequestOptions?) -> ListUsersExtendedOptionalListResponse</code></summary>
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

    _ = try await client.inlineUsers.inlineUsers.listWithCursorPagination()
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

**cursor:** `UUID?` 
    
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

<details><summary><code>client.inlineUsers.inlineUsers.<a href="/Sources/Resources/InlineUsers/InlineUsers/InlineUsersInlineUsersClient.swift">listUsernames</a>(startingAfter: String?, requestOptions: RequestOptions?) -> UsernameCursor</code></summary>
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

    _ = try await client.inlineUsers.inlineUsers.listWithCursorPagination(startingAfter: "starting_after")
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

**startingAfter:** `String?` 

The cursor used for pagination in order to fetch
the next page of results.
    
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

<details><summary><code>client.inlineUsers.inlineUsers.<a href="/Sources/Resources/InlineUsers/InlineUsers/InlineUsersInlineUsersClient.swift">listWithGlobalConfig</a>(offset: Int?, requestOptions: RequestOptions?) -> UsernameContainer</code></summary>
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

    _ = try await client.inlineUsers.inlineUsers.listWithCursorPagination()
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

**offset:** `Int?` 
    
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

## Users
<details><summary><code>client.users.<a href="/Sources/Resources/Users/UsersClient.swift">listWithCursorPagination</a>(page: Int?, perPage: Int?, order: OrderType?, startingAfter: String?, requestOptions: RequestOptions?) -> ListUsersPaginationResponseType</code></summary>
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

    _ = try await client.users.listWithCursorPagination(
        page: 1,
        perPage: 1,
        order: .asc,
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

**page:** `Int?` — Defaults to first page
    
</dd>
</dl>

<dl>
<dd>

**perPage:** `Int?` — Defaults to per page
    
</dd>
</dl>

<dl>
<dd>

**order:** `OrderType?` 
    
</dd>
</dl>

<dl>
<dd>

**startingAfter:** `String?` 

The cursor used for pagination in order to fetch
the next page of results.
    
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

<details><summary><code>client.users.<a href="/Sources/Resources/Users/UsersClient.swift">listWithMixedTypeCursorPagination</a>(cursor: String?, requestOptions: RequestOptions?) -> ListUsersMixedTypePaginationResponseType</code></summary>
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

    _ = try await client.users.listWithMixedTypeCursorPagination(cursor: "cursor")
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

**cursor:** `String?` 
    
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

<details><summary><code>client.users.<a href="/Sources/Resources/Users/UsersClient.swift">listWithBodyCursorPagination</a>(request: Requests.ListUsersBodyCursorPaginationRequestType, requestOptions: RequestOptions?) -> ListUsersPaginationResponseType</code></summary>
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

    _ = try await client.users.listWithMixedTypeCursorPagination()
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

**request:** `Requests.ListUsersBodyCursorPaginationRequestType` 
    
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

<details><summary><code>client.users.<a href="/Sources/Resources/Users/UsersClient.swift">listWithOffsetPagination</a>(page: Int?, perPage: Int?, order: OrderType?, startingAfter: String?, requestOptions: RequestOptions?) -> ListUsersPaginationResponseType</code></summary>
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

    _ = try await client.users.listWithCursorPagination(
        page: 1,
        perPage: 1,
        order: .asc,
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

**page:** `Int?` — Defaults to first page
    
</dd>
</dl>

<dl>
<dd>

**perPage:** `Int?` — Defaults to per page
    
</dd>
</dl>

<dl>
<dd>

**order:** `OrderType?` 
    
</dd>
</dl>

<dl>
<dd>

**startingAfter:** `String?` 

The cursor used for pagination in order to fetch
the next page of results.
    
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

<details><summary><code>client.users.<a href="/Sources/Resources/Users/UsersClient.swift">listWithDoubleOffsetPagination</a>(page: Double?, perPage: Double?, order: OrderType?, startingAfter: String?, requestOptions: RequestOptions?) -> ListUsersPaginationResponseType</code></summary>
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

    _ = try await client.users.listWithCursorPagination(
        page: 1.1,
        perPage: 1.1,
        order: .asc,
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

**page:** `Double?` — Defaults to first page
    
</dd>
</dl>

<dl>
<dd>

**perPage:** `Double?` — Defaults to per page
    
</dd>
</dl>

<dl>
<dd>

**order:** `OrderType?` 
    
</dd>
</dl>

<dl>
<dd>

**startingAfter:** `String?` 

The cursor used for pagination in order to fetch
the next page of results.
    
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

<details><summary><code>client.users.<a href="/Sources/Resources/Users/UsersClient.swift">listWithBodyOffsetPagination</a>(request: Requests.ListUsersBodyOffsetPaginationRequestType, requestOptions: RequestOptions?) -> ListUsersPaginationResponseType</code></summary>
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

    _ = try await client.users.listWithMixedTypeCursorPagination()
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

**request:** `Requests.ListUsersBodyOffsetPaginationRequestType` 
    
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

<details><summary><code>client.users.<a href="/Sources/Resources/Users/UsersClient.swift">listWithOffsetStepPagination</a>(page: Int?, limit: Int?, order: OrderType?, requestOptions: RequestOptions?) -> ListUsersPaginationResponseType</code></summary>
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

    _ = try await client.users.listWithCursorPagination(
        page: 1,
        order: .asc
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

**page:** `Int?` — Defaults to first page
    
</dd>
</dl>

<dl>
<dd>

**limit:** `Int?` 

The maximum number of elements to return.
This is also used as the step size in this
paginated endpoint.
    
</dd>
</dl>

<dl>
<dd>

**order:** `OrderType?` 
    
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

<details><summary><code>client.users.<a href="/Sources/Resources/Users/UsersClient.swift">listWithOffsetPaginationHasNextPage</a>(page: Int?, limit: Int?, order: OrderType?, requestOptions: RequestOptions?) -> ListUsersPaginationResponseType</code></summary>
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

    _ = try await client.users.listWithCursorPagination(
        page: 1,
        order: .asc
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

**page:** `Int?` — Defaults to first page
    
</dd>
</dl>

<dl>
<dd>

**limit:** `Int?` 

The maximum number of elements to return.
This is also used as the step size in this
paginated endpoint.
    
</dd>
</dl>

<dl>
<dd>

**order:** `OrderType?` 
    
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

<details><summary><code>client.users.<a href="/Sources/Resources/Users/UsersClient.swift">listWithExtendedResults</a>(cursor: UUID?, requestOptions: RequestOptions?) -> ListUsersExtendedResponseType</code></summary>
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

    _ = try await client.users.listWithCursorPagination()
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

**cursor:** `UUID?` 
    
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

<details><summary><code>client.users.<a href="/Sources/Resources/Users/UsersClient.swift">listWithExtendedResultsAndOptionalData</a>(cursor: UUID?, requestOptions: RequestOptions?) -> ListUsersExtendedOptionalListResponseType</code></summary>
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

    _ = try await client.users.listWithCursorPagination()
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

**cursor:** `UUID?` 
    
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

<details><summary><code>client.users.<a href="/Sources/Resources/Users/UsersClient.swift">listUsernames</a>(startingAfter: String?, requestOptions: RequestOptions?) -> UsernameCursor</code></summary>
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

    _ = try await client.users.listWithCursorPagination(startingAfter: "starting_after")
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

**startingAfter:** `String?` 

The cursor used for pagination in order to fetch
the next page of results.
    
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

<details><summary><code>client.users.<a href="/Sources/Resources/Users/UsersClient.swift">listWithGlobalConfig</a>(offset: Int?, requestOptions: RequestOptions?) -> UsernameContainerType</code></summary>
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

    _ = try await client.users.listWithCursorPagination()
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

**offset:** `Int?` 
    
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

