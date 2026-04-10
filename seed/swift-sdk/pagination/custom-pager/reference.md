# Reference
## Complex
<details><summary><code>client.complex.<a href="/Sources/Resources/Complex/ComplexClient.swift">search</a>(index: String, request: Requests.SearchRequest, requestOptions: RequestOptions?) -> PaginatedConversationResponse</code></summary>
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

    _ = try await client.complex.search(
        index: "index",
        request: .init(query: SearchRequestQuery.singleFilterSearchRequest(
            SingleFilterSearchRequest(

            )
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

**index:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**request:** `Requests.SearchRequest` 
    
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

## InlineUsersInlineUsers
<details><summary><code>client.inlineUsersInlineUsers.<a href="/Sources/Resources/InlineUsersInlineUsers/InlineUsersInlineUsersClient.swift">inlineUsersInlineUsersListWithCursorPagination</a>(page: Nullable&lt;Int&gt;?, perPage: Nullable&lt;Int&gt;?, order: InlineUsersOrder?, startingAfter: Nullable&lt;String&gt;?, requestOptions: RequestOptions?) -> InlineUsersListUsersPaginationResponse</code></summary>
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

    _ = try await client.inlineUsersInlineUsers.inlineUsersInlineUsersListWithCursorPagination()
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

**page:** `Nullable<Int>?` — Defaults to first page
    
</dd>
</dl>

<dl>
<dd>

**perPage:** `Nullable<Int>?` — Defaults to per page
    
</dd>
</dl>

<dl>
<dd>

**order:** `InlineUsersOrder?` 
    
</dd>
</dl>

<dl>
<dd>

**startingAfter:** `Nullable<String>?` 

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

<details><summary><code>client.inlineUsersInlineUsers.<a href="/Sources/Resources/InlineUsersInlineUsers/InlineUsersInlineUsersClient.swift">inlineUsersInlineUsersListWithMixedTypeCursorPagination</a>(cursor: Nullable&lt;String&gt;?, requestOptions: RequestOptions?) -> InlineUsersListUsersMixedTypePaginationResponse</code></summary>
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

    _ = try await client.inlineUsersInlineUsers.inlineUsersInlineUsersListWithMixedTypeCursorPagination()
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

**cursor:** `Nullable<String>?` 
    
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

<details><summary><code>client.inlineUsersInlineUsers.<a href="/Sources/Resources/InlineUsersInlineUsers/InlineUsersInlineUsersClient.swift">inlineUsersInlineUsersListWithBodyCursorPagination</a>(request: Requests.InlineUsersInlineUsersListWithBodyCursorPaginationRequest, requestOptions: RequestOptions?) -> InlineUsersListUsersPaginationResponse</code></summary>
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

    _ = try await client.inlineUsersInlineUsers.inlineUsersInlineUsersListWithBodyCursorPagination(request: .init())
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

**request:** `Requests.InlineUsersInlineUsersListWithBodyCursorPaginationRequest` 
    
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

<details><summary><code>client.inlineUsersInlineUsers.<a href="/Sources/Resources/InlineUsersInlineUsers/InlineUsersInlineUsersClient.swift">inlineUsersInlineUsersListWithOffsetPagination</a>(page: Nullable&lt;Int&gt;?, perPage: Nullable&lt;Int&gt;?, order: InlineUsersOrder?, startingAfter: Nullable&lt;String&gt;?, requestOptions: RequestOptions?) -> InlineUsersListUsersPaginationResponse</code></summary>
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

    _ = try await client.inlineUsersInlineUsers.inlineUsersInlineUsersListWithOffsetPagination()
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

**page:** `Nullable<Int>?` — Defaults to first page
    
</dd>
</dl>

<dl>
<dd>

**perPage:** `Nullable<Int>?` — Defaults to per page
    
</dd>
</dl>

<dl>
<dd>

**order:** `InlineUsersOrder?` 
    
</dd>
</dl>

<dl>
<dd>

**startingAfter:** `Nullable<String>?` 

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

<details><summary><code>client.inlineUsersInlineUsers.<a href="/Sources/Resources/InlineUsersInlineUsers/InlineUsersInlineUsersClient.swift">inlineUsersInlineUsersListWithDoubleOffsetPagination</a>(page: Nullable&lt;Double&gt;?, perPage: Nullable&lt;Double&gt;?, order: InlineUsersOrder?, startingAfter: Nullable&lt;String&gt;?, requestOptions: RequestOptions?) -> InlineUsersListUsersPaginationResponse</code></summary>
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

    _ = try await client.inlineUsersInlineUsers.inlineUsersInlineUsersListWithDoubleOffsetPagination()
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

**page:** `Nullable<Double>?` — Defaults to first page
    
</dd>
</dl>

<dl>
<dd>

**perPage:** `Nullable<Double>?` — Defaults to per page
    
</dd>
</dl>

<dl>
<dd>

**order:** `InlineUsersOrder?` 
    
</dd>
</dl>

<dl>
<dd>

**startingAfter:** `Nullable<String>?` 

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

<details><summary><code>client.inlineUsersInlineUsers.<a href="/Sources/Resources/InlineUsersInlineUsers/InlineUsersInlineUsersClient.swift">inlineUsersInlineUsersListWithBodyOffsetPagination</a>(request: Requests.InlineUsersInlineUsersListWithBodyOffsetPaginationRequest, requestOptions: RequestOptions?) -> InlineUsersListUsersPaginationResponse</code></summary>
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

    _ = try await client.inlineUsersInlineUsers.inlineUsersInlineUsersListWithBodyOffsetPagination(request: .init())
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

**request:** `Requests.InlineUsersInlineUsersListWithBodyOffsetPaginationRequest` 
    
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

<details><summary><code>client.inlineUsersInlineUsers.<a href="/Sources/Resources/InlineUsersInlineUsers/InlineUsersInlineUsersClient.swift">inlineUsersInlineUsersListWithOffsetStepPagination</a>(page: Nullable&lt;Int&gt;?, limit: Nullable&lt;Int&gt;?, order: InlineUsersOrder?, requestOptions: RequestOptions?) -> InlineUsersListUsersPaginationResponse</code></summary>
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

    _ = try await client.inlineUsersInlineUsers.inlineUsersInlineUsersListWithOffsetStepPagination()
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

**page:** `Nullable<Int>?` — Defaults to first page
    
</dd>
</dl>

<dl>
<dd>

**limit:** `Nullable<Int>?` 

The maximum number of elements to return.
This is also used as the step size in this
paginated endpoint.
    
</dd>
</dl>

<dl>
<dd>

**order:** `InlineUsersOrder?` 
    
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

<details><summary><code>client.inlineUsersInlineUsers.<a href="/Sources/Resources/InlineUsersInlineUsers/InlineUsersInlineUsersClient.swift">inlineUsersInlineUsersListWithOffsetPaginationHasNextPage</a>(page: Nullable&lt;Int&gt;?, limit: Nullable&lt;Int&gt;?, order: InlineUsersOrder?, requestOptions: RequestOptions?) -> InlineUsersListUsersPaginationResponse</code></summary>
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

    _ = try await client.inlineUsersInlineUsers.inlineUsersInlineUsersListWithOffsetPaginationHasNextPage()
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

**page:** `Nullable<Int>?` — Defaults to first page
    
</dd>
</dl>

<dl>
<dd>

**limit:** `Nullable<Int>?` 

The maximum number of elements to return.
This is also used as the step size in this
paginated endpoint.
    
</dd>
</dl>

<dl>
<dd>

**order:** `InlineUsersOrder?` 
    
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

<details><summary><code>client.inlineUsersInlineUsers.<a href="/Sources/Resources/InlineUsersInlineUsers/InlineUsersInlineUsersClient.swift">inlineUsersInlineUsersListWithExtendedResults</a>(cursor: Nullable&lt;String&gt;?, requestOptions: RequestOptions?) -> InlineUsersListUsersExtendedResponse</code></summary>
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

    _ = try await client.inlineUsersInlineUsers.inlineUsersInlineUsersListWithExtendedResults()
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

**cursor:** `Nullable<String>?` 
    
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

<details><summary><code>client.inlineUsersInlineUsers.<a href="/Sources/Resources/InlineUsersInlineUsers/InlineUsersInlineUsersClient.swift">inlineUsersInlineUsersListWithExtendedResultsAndOptionalData</a>(cursor: Nullable&lt;String&gt;?, requestOptions: RequestOptions?) -> InlineUsersListUsersExtendedOptionalListResponse</code></summary>
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

    _ = try await client.inlineUsersInlineUsers.inlineUsersInlineUsersListWithExtendedResultsAndOptionalData()
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

**cursor:** `Nullable<String>?` 
    
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

<details><summary><code>client.inlineUsersInlineUsers.<a href="/Sources/Resources/InlineUsersInlineUsers/InlineUsersInlineUsersClient.swift">inlineUsersInlineUsersListUsernames</a>(startingAfter: Nullable&lt;String&gt;?, requestOptions: RequestOptions?) -> UsernameCursor</code></summary>
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

    _ = try await client.inlineUsersInlineUsers.inlineUsersInlineUsersListUsernames()
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

**startingAfter:** `Nullable<String>?` 

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

<details><summary><code>client.inlineUsersInlineUsers.<a href="/Sources/Resources/InlineUsersInlineUsers/InlineUsersInlineUsersClient.swift">inlineUsersInlineUsersListWithGlobalConfig</a>(offset: Nullable&lt;Int&gt;?, requestOptions: RequestOptions?) -> InlineUsersUsernameContainer</code></summary>
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

    _ = try await client.inlineUsersInlineUsers.inlineUsersInlineUsersListWithGlobalConfig()
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

**offset:** `Nullable<Int>?` 
    
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
<details><summary><code>client.users.<a href="/Sources/Resources/Users/UsersClient.swift">listwithcursorpagination</a>(page: Nullable&lt;Int&gt;?, perPage: Nullable&lt;Int&gt;?, order: Order?, startingAfter: Nullable&lt;String&gt;?, requestOptions: RequestOptions?) -> ListUsersPaginationResponse</code></summary>
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

    _ = try await client.users.listwithcursorpagination()
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

**page:** `Nullable<Int>?` — Defaults to first page
    
</dd>
</dl>

<dl>
<dd>

**perPage:** `Nullable<Int>?` — Defaults to per page
    
</dd>
</dl>

<dl>
<dd>

**order:** `Order?` 
    
</dd>
</dl>

<dl>
<dd>

**startingAfter:** `Nullable<String>?` 

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

<details><summary><code>client.users.<a href="/Sources/Resources/Users/UsersClient.swift">listwithmixedtypecursorpagination</a>(cursor: Nullable&lt;String&gt;?, requestOptions: RequestOptions?) -> ListUsersMixedTypePaginationResponse</code></summary>
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

    _ = try await client.users.listwithmixedtypecursorpagination()
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

**cursor:** `Nullable<String>?` 
    
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

<details><summary><code>client.users.<a href="/Sources/Resources/Users/UsersClient.swift">listwithbodycursorpagination</a>(request: Requests.UsersListWithBodyCursorPaginationRequest, requestOptions: RequestOptions?) -> ListUsersPaginationResponse</code></summary>
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

    _ = try await client.users.listwithbodycursorpagination(request: .init())
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

**request:** `Requests.UsersListWithBodyCursorPaginationRequest` 
    
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

<details><summary><code>client.users.<a href="/Sources/Resources/Users/UsersClient.swift">listwithtoplevelbodycursorpagination</a>(request: Requests.UsersListWithTopLevelBodyCursorPaginationRequest, requestOptions: RequestOptions?) -> ListUsersTopLevelCursorPaginationResponse</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Pagination endpoint with a top-level cursor field in the request body.
This tests that the mock server correctly ignores cursor mismatches
when getNextPage() is called with a different cursor value.
</dd>
</dl>
</dd>
</dl>

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

    _ = try await client.users.listwithtoplevelbodycursorpagination(request: .init())
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

**request:** `Requests.UsersListWithTopLevelBodyCursorPaginationRequest` 
    
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

<details><summary><code>client.users.<a href="/Sources/Resources/Users/UsersClient.swift">listwithoffsetpagination</a>(page: Nullable&lt;Int&gt;?, perPage: Nullable&lt;Int&gt;?, order: Order?, startingAfter: Nullable&lt;String&gt;?, requestOptions: RequestOptions?) -> ListUsersPaginationResponse</code></summary>
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

    _ = try await client.users.listwithoffsetpagination()
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

**page:** `Nullable<Int>?` — Defaults to first page
    
</dd>
</dl>

<dl>
<dd>

**perPage:** `Nullable<Int>?` — Defaults to per page
    
</dd>
</dl>

<dl>
<dd>

**order:** `Order?` 
    
</dd>
</dl>

<dl>
<dd>

**startingAfter:** `Nullable<String>?` 

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

<details><summary><code>client.users.<a href="/Sources/Resources/Users/UsersClient.swift">listwithdoubleoffsetpagination</a>(page: Nullable&lt;Double&gt;?, perPage: Nullable&lt;Double&gt;?, order: Order?, startingAfter: Nullable&lt;String&gt;?, requestOptions: RequestOptions?) -> ListUsersPaginationResponse</code></summary>
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

    _ = try await client.users.listwithdoubleoffsetpagination()
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

**page:** `Nullable<Double>?` — Defaults to first page
    
</dd>
</dl>

<dl>
<dd>

**perPage:** `Nullable<Double>?` — Defaults to per page
    
</dd>
</dl>

<dl>
<dd>

**order:** `Order?` 
    
</dd>
</dl>

<dl>
<dd>

**startingAfter:** `Nullable<String>?` 

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

<details><summary><code>client.users.<a href="/Sources/Resources/Users/UsersClient.swift">listwithbodyoffsetpagination</a>(request: Requests.UsersListWithBodyOffsetPaginationRequest, requestOptions: RequestOptions?) -> ListUsersPaginationResponse</code></summary>
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

    _ = try await client.users.listwithbodyoffsetpagination(request: .init())
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

**request:** `Requests.UsersListWithBodyOffsetPaginationRequest` 
    
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

<details><summary><code>client.users.<a href="/Sources/Resources/Users/UsersClient.swift">listwithoffsetsteppagination</a>(page: Nullable&lt;Int&gt;?, limit: Nullable&lt;Int&gt;?, order: Order?, requestOptions: RequestOptions?) -> ListUsersPaginationResponse</code></summary>
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

    _ = try await client.users.listwithoffsetsteppagination()
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

**page:** `Nullable<Int>?` — Defaults to first page
    
</dd>
</dl>

<dl>
<dd>

**limit:** `Nullable<Int>?` 

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

<details><summary><code>client.users.<a href="/Sources/Resources/Users/UsersClient.swift">listwithoffsetpaginationhasnextpage</a>(page: Nullable&lt;Int&gt;?, limit: Nullable&lt;Int&gt;?, order: Order?, requestOptions: RequestOptions?) -> ListUsersPaginationResponse</code></summary>
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

    _ = try await client.users.listwithoffsetpaginationhasnextpage()
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

**page:** `Nullable<Int>?` — Defaults to first page
    
</dd>
</dl>

<dl>
<dd>

**limit:** `Nullable<Int>?` 

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

<details><summary><code>client.users.<a href="/Sources/Resources/Users/UsersClient.swift">listwithextendedresults</a>(cursor: Nullable&lt;String&gt;?, requestOptions: RequestOptions?) -> ListUsersExtendedResponse</code></summary>
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

    _ = try await client.users.listwithextendedresults()
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

**cursor:** `Nullable<String>?` 
    
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

<details><summary><code>client.users.<a href="/Sources/Resources/Users/UsersClient.swift">listwithextendedresultsandoptionaldata</a>(cursor: Nullable&lt;String&gt;?, requestOptions: RequestOptions?) -> ListUsersExtendedOptionalListResponse</code></summary>
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

    _ = try await client.users.listwithextendedresultsandoptionaldata()
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

**cursor:** `Nullable<String>?` 
    
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

<details><summary><code>client.users.<a href="/Sources/Resources/Users/UsersClient.swift">listusernames</a>(startingAfter: Nullable&lt;String&gt;?, requestOptions: RequestOptions?) -> UsernameCursor</code></summary>
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

    _ = try await client.users.listusernames()
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

**startingAfter:** `Nullable<String>?` 

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

<details><summary><code>client.users.<a href="/Sources/Resources/Users/UsersClient.swift">listusernameswithoptionalresponse</a>(startingAfter: Nullable&lt;String&gt;?, requestOptions: RequestOptions?) -> UsernameCursor</code></summary>
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

    _ = try await client.users.listusernameswithoptionalresponse()
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

**startingAfter:** `Nullable<String>?` 

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

<details><summary><code>client.users.<a href="/Sources/Resources/Users/UsersClient.swift">listwithglobalconfig</a>(offset: Nullable&lt;Int&gt;?, requestOptions: RequestOptions?) -> UsernameContainer</code></summary>
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

    _ = try await client.users.listwithglobalconfig()
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

**offset:** `Nullable<Int>?` 
    
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

<details><summary><code>client.users.<a href="/Sources/Resources/Users/UsersClient.swift">listwithoptionaldata</a>(page: Nullable&lt;Int&gt;?, requestOptions: RequestOptions?) -> ListUsersOptionalDataPaginationResponse</code></summary>
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

    _ = try await client.users.listwithoptionaldata()
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

**page:** `Nullable<Int>?` — Defaults to first page
    
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

<details><summary><code>client.users.<a href="/Sources/Resources/Users/UsersClient.swift">listwithaliaseddata</a>(page: Nullable&lt;Int&gt;?, perPage: Nullable&lt;Int&gt;?, startingAfter: Nullable&lt;String&gt;?, requestOptions: RequestOptions?) -> ListUsersAliasedDataPaginationResponse</code></summary>
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

    _ = try await client.users.listwithaliaseddata()
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

**page:** `Nullable<Int>?` — Defaults to first page
    
</dd>
</dl>

<dl>
<dd>

**perPage:** `Nullable<Int>?` — Defaults to per page
    
</dd>
</dl>

<dl>
<dd>

**startingAfter:** `Nullable<String>?` 

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

