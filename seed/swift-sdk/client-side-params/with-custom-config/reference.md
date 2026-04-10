# Reference
## Service
<details><summary><code>client.service.<a href="/Sources/Resources/Service/ServiceClient.swift">listresources</a>(page: Int, perPage: Int, sort: String, order: String, includeTotals: Bool, fields: Nullable&lt;String&gt;?, search: Nullable&lt;String&gt;?, requestOptions: RequestOptions?) -> [Resource]</code></summary>
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
import MyCustomModule

private func main() async throws {
    let client = MyCustomClient(token: "<token>")

    _ = try await client.service.listresources(
        page: 1,
        perPage: 1,
        sort: "sort",
        order: "order",
        includeTotals: true
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

**fields:** `Nullable<String>?` — Comma-separated list of fields to include
    
</dd>
</dl>

<dl>
<dd>

**search:** `Nullable<String>?` — Search query
    
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

<details><summary><code>client.service.<a href="/Sources/Resources/Service/ServiceClient.swift">getresource</a>(resourceId: String, includeMetadata: Bool, format: String, requestOptions: RequestOptions?) -> Resource</code></summary>
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
import MyCustomModule

private func main() async throws {
    let client = MyCustomClient(token: "<token>")

    _ = try await client.service.getresource(
        resourceId: "resourceId",
        includeMetadata: true,
        format: "format"
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

<details><summary><code>client.service.<a href="/Sources/Resources/Service/ServiceClient.swift">searchresources</a>(limit: Int, offset: Int, request: Requests.ServiceSearchResourcesRequest, requestOptions: RequestOptions?) -> SearchResponse</code></summary>
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
import MyCustomModule

private func main() async throws {
    let client = MyCustomClient(token: "<token>")

    _ = try await client.service.searchresources(
        limit: 1,
        offset: 1,
        request: .init()
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

**request:** `Requests.ServiceSearchResourcesRequest` 
    
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

<details><summary><code>client.service.<a href="/Sources/Resources/Service/ServiceClient.swift">listusers</a>(page: Nullable&lt;Int&gt;?, perPage: Nullable&lt;Int&gt;?, includeTotals: Nullable&lt;Bool&gt;?, sort: Nullable&lt;String&gt;?, connection: Nullable&lt;String&gt;?, q: Nullable&lt;String&gt;?, searchEngine: Nullable&lt;String&gt;?, fields: Nullable&lt;String&gt;?, requestOptions: RequestOptions?) -> PaginatedUserResponse</code></summary>
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
import MyCustomModule

private func main() async throws {
    let client = MyCustomClient(token: "<token>")

    _ = try await client.service.listusers()
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

**page:** `Nullable<Int>?` — Page index of the results to return. First page is 0.
    
</dd>
</dl>

<dl>
<dd>

**perPage:** `Nullable<Int>?` — Number of results per page.
    
</dd>
</dl>

<dl>
<dd>

**includeTotals:** `Nullable<Bool>?` — Return results inside an object that contains the total result count (true) or as a direct array of results (false, default).
    
</dd>
</dl>

<dl>
<dd>

**sort:** `Nullable<String>?` — Field to sort by. Use field:order where order is 1 for ascending and -1 for descending.
    
</dd>
</dl>

<dl>
<dd>

**connection:** `Nullable<String>?` — Connection filter
    
</dd>
</dl>

<dl>
<dd>

**q:** `Nullable<String>?` — Query string following Lucene query string syntax
    
</dd>
</dl>

<dl>
<dd>

**searchEngine:** `Nullable<String>?` — Search engine version (v1, v2, or v3)
    
</dd>
</dl>

<dl>
<dd>

**fields:** `Nullable<String>?` — Comma-separated list of fields to include or exclude
    
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

<details><summary><code>client.service.<a href="/Sources/Resources/Service/ServiceClient.swift">createuser</a>(request: Requests.CreateUserRequest, requestOptions: RequestOptions?) -> User</code></summary>
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
import MyCustomModule

private func main() async throws {
    let client = MyCustomClient(token: "<token>")

    _ = try await client.service.createuser(request: .init(
        email: "email",
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

**request:** `Requests.CreateUserRequest` 
    
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

<details><summary><code>client.service.<a href="/Sources/Resources/Service/ServiceClient.swift">getuserbyid</a>(userId: String, fields: Nullable&lt;String&gt;?, includeFields: Nullable&lt;Bool&gt;?, requestOptions: RequestOptions?) -> User</code></summary>
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
import MyCustomModule

private func main() async throws {
    let client = MyCustomClient(token: "<token>")

    _ = try await client.service.getuserbyid(userId: "userId")
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

**fields:** `Nullable<String>?` — Comma-separated list of fields to include or exclude
    
</dd>
</dl>

<dl>
<dd>

**includeFields:** `Nullable<Bool>?` — true to include the fields specified, false to exclude them
    
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

<details><summary><code>client.service.<a href="/Sources/Resources/Service/ServiceClient.swift">deleteuser</a>(userId: String, requestOptions: RequestOptions?) -> Void</code></summary>
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
import MyCustomModule

private func main() async throws {
    let client = MyCustomClient(token: "<token>")

    _ = try await client.service.deleteuser(userId: "userId")
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

<details><summary><code>client.service.<a href="/Sources/Resources/Service/ServiceClient.swift">updateuser</a>(userId: String, request: Requests.UpdateUserRequest, requestOptions: RequestOptions?) -> User</code></summary>
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
import MyCustomModule

private func main() async throws {
    let client = MyCustomClient(token: "<token>")

    _ = try await client.service.updateuser(
        userId: "userId",
        request: .init()
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

**request:** `Requests.UpdateUserRequest` 
    
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

<details><summary><code>client.service.<a href="/Sources/Resources/Service/ServiceClient.swift">listconnections</a>(strategy: Nullable&lt;String&gt;?, name: Nullable&lt;String&gt;?, fields: Nullable&lt;String&gt;?, requestOptions: RequestOptions?) -> [Connection]</code></summary>
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
import MyCustomModule

private func main() async throws {
    let client = MyCustomClient(token: "<token>")

    _ = try await client.service.listconnections()
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

**strategy:** `Nullable<String>?` — Filter by strategy type (e.g., auth0, google-oauth2, samlp)
    
</dd>
</dl>

<dl>
<dd>

**name:** `Nullable<String>?` — Filter by connection name
    
</dd>
</dl>

<dl>
<dd>

**fields:** `Nullable<String>?` — Comma-separated list of fields to include
    
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

<details><summary><code>client.service.<a href="/Sources/Resources/Service/ServiceClient.swift">getconnection</a>(connectionId: String, fields: Nullable&lt;String&gt;?, requestOptions: RequestOptions?) -> Connection</code></summary>
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
import MyCustomModule

private func main() async throws {
    let client = MyCustomClient(token: "<token>")

    _ = try await client.service.getconnection(connectionId: "connectionId")
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

**fields:** `Nullable<String>?` — Comma-separated list of fields to include
    
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

<details><summary><code>client.service.<a href="/Sources/Resources/Service/ServiceClient.swift">listclients</a>(fields: Nullable&lt;String&gt;?, includeFields: Nullable&lt;Bool&gt;?, page: Nullable&lt;Int&gt;?, perPage: Nullable&lt;Int&gt;?, includeTotals: Nullable&lt;Bool&gt;?, isGlobal: Nullable&lt;Bool&gt;?, isFirstParty: Nullable&lt;Bool&gt;?, appType: Nullable&lt;[String]&gt;?, requestOptions: RequestOptions?) -> PaginatedClientResponse</code></summary>
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
import MyCustomModule

private func main() async throws {
    let client = MyCustomClient(token: "<token>")

    _ = try await client.service.listclients()
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

**fields:** `Nullable<String>?` — Comma-separated list of fields to include
    
</dd>
</dl>

<dl>
<dd>

**includeFields:** `Nullable<Bool>?` — Whether specified fields are included or excluded
    
</dd>
</dl>

<dl>
<dd>

**page:** `Nullable<Int>?` — Page number (zero-based)
    
</dd>
</dl>

<dl>
<dd>

**perPage:** `Nullable<Int>?` — Number of results per page
    
</dd>
</dl>

<dl>
<dd>

**includeTotals:** `Nullable<Bool>?` — Include total count in response
    
</dd>
</dl>

<dl>
<dd>

**isGlobal:** `Nullable<Bool>?` — Filter by global clients
    
</dd>
</dl>

<dl>
<dd>

**isFirstParty:** `Nullable<Bool>?` — Filter by first party clients
    
</dd>
</dl>

<dl>
<dd>

**appType:** `Nullable<[String]>?` — Filter by application type (spa, native, regular_web, non_interactive)
    
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

<details><summary><code>client.service.<a href="/Sources/Resources/Service/ServiceClient.swift">getclient</a>(clientId: String, fields: Nullable&lt;String&gt;?, includeFields: Nullable&lt;Bool&gt;?, requestOptions: RequestOptions?) -> Client</code></summary>
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
import MyCustomModule

private func main() async throws {
    let client = MyCustomClient(token: "<token>")

    _ = try await client.service.getclient(clientId: "clientId")
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

**fields:** `Nullable<String>?` — Comma-separated list of fields to include
    
</dd>
</dl>

<dl>
<dd>

**includeFields:** `Nullable<Bool>?` — Whether specified fields are included or excluded
    
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

