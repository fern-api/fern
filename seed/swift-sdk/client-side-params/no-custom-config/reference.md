# Reference
## Service
<details><summary><code>client.service.<a href="/Sources/Resources/Service/ServiceClient.swift">listResources</a>(page: Int, perPage: Int, sort: String, order: String, includeTotals: Bool, fields: String?, search: String?, requestOptions: RequestOptions?) -> [Resource]</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

List resources with pagination
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
import ClientSideParams

private func main() async throws {
    let client = ClientSideParamsClient(token: "<token>")

    _ = try await client.service.listResources(
        page: 1,
        perPage: 1,
        sort: "created_at",
        order: "desc",
        includeTotals: true,
        fields: "fields",
        search: "search"
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

**page:** `Int` — Zero-indexed page number
    
</dd>
</dl>

<dl>
<dd>

**perPage:** `Int` — Number of items per page
    
</dd>
</dl>

<dl>
<dd>

**sort:** `String` — Sort field
    
</dd>
</dl>

<dl>
<dd>

**order:** `String` — Sort order (asc or desc)
    
</dd>
</dl>

<dl>
<dd>

**includeTotals:** `Bool` — Whether to include total count
    
</dd>
</dl>

<dl>
<dd>

**fields:** `String?` — Comma-separated list of fields to include
    
</dd>
</dl>

<dl>
<dd>

**search:** `String?` — Search query
    
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

<details><summary><code>client.service.<a href="/Sources/Resources/Service/ServiceClient.swift">getResource</a>(resourceId: String, includeMetadata: Bool, format: String, requestOptions: RequestOptions?) -> Resource</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Get a single resource
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
import ClientSideParams

private func main() async throws {
    let client = ClientSideParamsClient(token: "<token>")

    _ = try await client.service.getResource(
        resourceId: "resourceId",
        includeMetadata: true,
        format: "json"
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

**resourceId:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**includeMetadata:** `Bool` — Include metadata in response
    
</dd>
</dl>

<dl>
<dd>

**format:** `String` — Response format
    
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

<details><summary><code>client.service.<a href="/Sources/Resources/Service/ServiceClient.swift">searchResources</a>(limit: Int, offset: Int, request: Requests.SearchResourcesRequest, requestOptions: RequestOptions?) -> SearchResponse</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Search resources with complex parameters
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
import ClientSideParams

private func main() async throws {
    let client = ClientSideParamsClient(token: "<token>")

    _ = try await client.service.searchResources(
        limit: 1,
        offset: 1,
        request: .init(
            query: "query",
            filters: [
                "filters": .object([
                    "key": .string("value")
                ])
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

**limit:** `Int` — Maximum results to return
    
</dd>
</dl>

<dl>
<dd>

**offset:** `Int` — Offset for pagination
    
</dd>
</dl>

<dl>
<dd>

**request:** `Requests.SearchResourcesRequest` 
    
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

<details><summary><code>client.service.<a href="/Sources/Resources/Service/ServiceClient.swift">listUsers</a>(page: Int?, perPage: Int?, includeTotals: Bool?, sort: String?, connection: String?, q: String?, searchEngine: String?, fields: String?, requestOptions: RequestOptions?) -> PaginatedUserResponse</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

List or search for users
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
import ClientSideParams

private func main() async throws {
    let client = ClientSideParamsClient(token: "<token>")

    _ = try await client.service.listUsers(
        page: 1,
        perPage: 1,
        includeTotals: true,
        sort: "sort",
        connection: "connection",
        q: "q",
        searchEngine: "search_engine",
        fields: "fields"
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

**page:** `Int?` — Page index of the results to return. First page is 0.
    
</dd>
</dl>

<dl>
<dd>

**perPage:** `Int?` — Number of results per page.
    
</dd>
</dl>

<dl>
<dd>

**includeTotals:** `Bool?` — Return results inside an object that contains the total result count (true) or as a direct array of results (false, default).
    
</dd>
</dl>

<dl>
<dd>

**sort:** `String?` — Field to sort by. Use field:order where order is 1 for ascending and -1 for descending.
    
</dd>
</dl>

<dl>
<dd>

**connection:** `String?` — Connection filter
    
</dd>
</dl>

<dl>
<dd>

**q:** `String?` — Query string following Lucene query string syntax
    
</dd>
</dl>

<dl>
<dd>

**searchEngine:** `String?` — Search engine version (v1, v2, or v3)
    
</dd>
</dl>

<dl>
<dd>

**fields:** `String?` — Comma-separated list of fields to include or exclude
    
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

<details><summary><code>client.service.<a href="/Sources/Resources/Service/ServiceClient.swift">getUserById</a>(userId: String, fields: String?, includeFields: Bool?, requestOptions: RequestOptions?) -> User</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Get a user by ID
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
import ClientSideParams

private func main() async throws {
    let client = ClientSideParamsClient(token: "<token>")

    _ = try await client.service.getUserById(
        userId: "userId",
        fields: "fields",
        includeFields: true
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

**userId:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**fields:** `String?` — Comma-separated list of fields to include or exclude
    
</dd>
</dl>

<dl>
<dd>

**includeFields:** `Bool?` — true to include the fields specified, false to exclude them
    
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

<details><summary><code>client.service.<a href="/Sources/Resources/Service/ServiceClient.swift">createUser</a>(request: CreateUserRequest, requestOptions: RequestOptions?) -> User</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Create a new user
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
import ClientSideParams

private func main() async throws {
    let client = ClientSideParamsClient(token: "<token>")

    _ = try await client.service.createUser(request: CreateUserRequest(
        email: "email",
        emailVerified: true,
        username: "username",
        password: "password",
        phoneNumber: "phone_number",
        phoneVerified: true,
        userMetadata: [
            "user_metadata": .object([
                "key": .string("value")
            ])
        ],
        appMetadata: [
            "app_metadata": .object([
                "key": .string("value")
            ])
        ],
        connection: "connection"
    ))
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

**request:** `CreateUserRequest` 
    
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

<details><summary><code>client.service.<a href="/Sources/Resources/Service/ServiceClient.swift">updateUser</a>(userId: String, request: UpdateUserRequest, requestOptions: RequestOptions?) -> User</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Update a user
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
import ClientSideParams

private func main() async throws {
    let client = ClientSideParamsClient(token: "<token>")

    _ = try await client.service.updateUser(
        userId: "userId",
        request: UpdateUserRequest(
            email: "email",
            emailVerified: true,
            username: "username",
            phoneNumber: "phone_number",
            phoneVerified: true,
            userMetadata: [
                "user_metadata": .object([
                    "key": .string("value")
                ])
            ],
            appMetadata: [
                "app_metadata": .object([
                    "key": .string("value")
                ])
            ],
            password: "password",
            blocked: true
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

**userId:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**request:** `UpdateUserRequest` 
    
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

<details><summary><code>client.service.<a href="/Sources/Resources/Service/ServiceClient.swift">deleteUser</a>(userId: String, requestOptions: RequestOptions?) -> Void</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Delete a user
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
import ClientSideParams

private func main() async throws {
    let client = ClientSideParamsClient(token: "<token>")

    _ = try await client.service.deleteUser(userId: "userId")
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

**userId:** `String` 
    
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

<details><summary><code>client.service.<a href="/Sources/Resources/Service/ServiceClient.swift">listConnections</a>(strategy: String?, name: String?, fields: String?, requestOptions: RequestOptions?) -> [Connection]</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

List all connections
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
import ClientSideParams

private func main() async throws {
    let client = ClientSideParamsClient(token: "<token>")

    _ = try await client.service.listConnections(
        strategy: "strategy",
        name: "name",
        fields: "fields"
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

**strategy:** `String?` — Filter by strategy type (e.g., auth0, google-oauth2, samlp)
    
</dd>
</dl>

<dl>
<dd>

**name:** `String?` — Filter by connection name
    
</dd>
</dl>

<dl>
<dd>

**fields:** `String?` — Comma-separated list of fields to include
    
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

<details><summary><code>client.service.<a href="/Sources/Resources/Service/ServiceClient.swift">getConnection</a>(connectionId: String, fields: String?, requestOptions: RequestOptions?) -> Connection</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Get a connection by ID
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
import ClientSideParams

private func main() async throws {
    let client = ClientSideParamsClient(token: "<token>")

    _ = try await client.service.getConnection(
        connectionId: "connectionId",
        fields: "fields"
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

**connectionId:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**fields:** `String?` — Comma-separated list of fields to include
    
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

<details><summary><code>client.service.<a href="/Sources/Resources/Service/ServiceClient.swift">listClients</a>(fields: String?, includeFields: Bool?, page: Int?, perPage: Int?, includeTotals: Bool?, isGlobal: Bool?, isFirstParty: Bool?, appType: [String]?, requestOptions: RequestOptions?) -> PaginatedClientResponse</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

List all clients/applications
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
import ClientSideParams

private func main() async throws {
    let client = ClientSideParamsClient(token: "<token>")

    _ = try await client.service.listClients(
        fields: "fields",
        includeFields: true,
        page: 1,
        perPage: 1,
        includeTotals: true,
        isGlobal: true,
        isFirstParty: true,
        appType: [
            "app_type",
            "app_type"
        ]
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

**fields:** `String?` — Comma-separated list of fields to include
    
</dd>
</dl>

<dl>
<dd>

**includeFields:** `Bool?` — Whether specified fields are included or excluded
    
</dd>
</dl>

<dl>
<dd>

**page:** `Int?` — Page number (zero-based)
    
</dd>
</dl>

<dl>
<dd>

**perPage:** `Int?` — Number of results per page
    
</dd>
</dl>

<dl>
<dd>

**includeTotals:** `Bool?` — Include total count in response
    
</dd>
</dl>

<dl>
<dd>

**isGlobal:** `Bool?` — Filter by global clients
    
</dd>
</dl>

<dl>
<dd>

**isFirstParty:** `Bool?` — Filter by first party clients
    
</dd>
</dl>

<dl>
<dd>

**appType:** `[String]?` — Filter by application type (spa, native, regular_web, non_interactive)
    
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

<details><summary><code>client.service.<a href="/Sources/Resources/Service/ServiceClient.swift">getClient</a>(clientId: String, fields: String?, includeFields: Bool?, requestOptions: RequestOptions?) -> Client</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Get a client by ID
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
import ClientSideParams

private func main() async throws {
    let client = ClientSideParamsClient(token: "<token>")

    _ = try await client.service.getClient(
        clientId: "clientId",
        fields: "fields",
        includeFields: true
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

**clientId:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**fields:** `String?` — Comma-separated list of fields to include
    
</dd>
</dl>

<dl>
<dd>

**includeFields:** `Bool?` — Whether specified fields are included or excluded
    
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

