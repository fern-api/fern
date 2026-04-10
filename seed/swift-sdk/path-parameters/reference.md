# Reference
## Organizations
<details><summary><code>client.organizations.<a href="/Sources/Resources/Organizations/OrganizationsClient.swift">getorganization</a>(tenantId: String, organizationId: String, requestOptions: RequestOptions?) -> Organization</code></summary>
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

    _ = try await client.organizations.getorganization(
        tenantId: "tenant_id",
        organizationId: "organization_id"
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

**tenantId:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**organizationId:** `String` 
    
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

<details><summary><code>client.organizations.<a href="/Sources/Resources/Organizations/OrganizationsClient.swift">getorganizationuser</a>(tenantId: String, organizationId: String, userId: String, requestOptions: RequestOptions?) -> User</code></summary>
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

    _ = try await client.organizations.getorganizationuser(
        tenantId: "tenant_id",
        organizationId: "organization_id",
        userId: "user_id"
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

**tenantId:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**organizationId:** `String` 
    
</dd>
</dl>

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

<details><summary><code>client.organizations.<a href="/Sources/Resources/Organizations/OrganizationsClient.swift">searchorganizations</a>(tenantId: String, organizationId: String, limit: Nullable&lt;Int&gt;?, requestOptions: RequestOptions?) -> [Organization]</code></summary>
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

    _ = try await client.organizations.searchorganizations(
        tenantId: "tenant_id",
        organizationId: "organization_id"
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

**tenantId:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**organizationId:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**limit:** `Nullable<Int>?` 
    
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

## User
<details><summary><code>client.user.<a href="/Sources/Resources/User/UserClient.swift">getuser</a>(tenantId: String, userId: String, requestOptions: RequestOptions?) -> User</code></summary>
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

    _ = try await client.user.getuser(
        tenantId: "tenant_id",
        userId: "user_id"
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

**tenantId:** `String` 
    
</dd>
</dl>

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

<details><summary><code>client.user.<a href="/Sources/Resources/User/UserClient.swift">updateuser</a>(tenantId: String, userId: String, request: User, requestOptions: RequestOptions?) -> User</code></summary>
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

    _ = try await client.user.updateuser(
        tenantId: "tenant_id",
        userId: "user_id",
        request: .init(body: User(
            name: "name",
            tags: [
                "tags"
            ]
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

**tenantId:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**userId:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**request:** `User` 
    
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

<details><summary><code>client.user.<a href="/Sources/Resources/User/UserClient.swift">createuser</a>(tenantId: String, request: User, requestOptions: RequestOptions?) -> User</code></summary>
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

    _ = try await client.user.createuser(
        tenantId: "tenant_id",
        request: .init(body: User(
            name: "name",
            tags: [
                "tags"
            ]
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

**tenantId:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**request:** `User` 
    
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

<details><summary><code>client.user.<a href="/Sources/Resources/User/UserClient.swift">searchusers</a>(tenantId: String, userId: String, limit: Nullable&lt;Int&gt;?, requestOptions: RequestOptions?) -> [User]</code></summary>
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

    _ = try await client.user.searchusers(
        tenantId: "tenant_id",
        userId: "user_id"
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

**tenantId:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**userId:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**limit:** `Nullable<Int>?` 
    
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

<details><summary><code>client.user.<a href="/Sources/Resources/User/UserClient.swift">getusermetadata</a>(tenantId: String, userId: String, version: String, requestOptions: RequestOptions?) -> User</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Test endpoint with path parameter that has a text prefix (v{version})
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
    let client = ApiClient()

    _ = try await client.user.getusermetadata(
        tenantId: "tenant_id",
        userId: "user_id",
        version: 1
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

**tenantId:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**userId:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**version:** `String` 
    
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

<details><summary><code>client.user.<a href="/Sources/Resources/User/UserClient.swift">getuserspecifics</a>(tenantId: String, userId: String, version: String, thought: String, requestOptions: RequestOptions?) -> User</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Test endpoint with path parameters listed in different order than found in path
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
    let client = ApiClient()

    _ = try await client.user.getuserspecifics(
        tenantId: "tenant_id",
        userId: "user_id",
        version: 1,
        thought: "thought"
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

**tenantId:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**userId:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**version:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**thought:** `String` 
    
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

