# Reference
## Nullableoptional
<details><summary><code>client.nullableoptional.<a href="/Sources/Resources/Nullableoptional/NullableoptionalClient.swift">getuser</a>(userId: String, requestOptions: RequestOptions?) -> UserResponse</code></summary>
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
import Api

private func main() async throws {
    let client = ApiClient()

    _ = try await client.nullableoptional.getuser(userId: "userId")
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

<details><summary><code>client.nullableoptional.<a href="/Sources/Resources/Nullableoptional/NullableoptionalClient.swift">updateuser</a>(userId: String, request: Requests.UpdateUserRequest, requestOptions: RequestOptions?) -> UserResponse</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Update a user (partial update)
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

    _ = try await client.nullableoptional.updateuser(
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

<details><summary><code>client.nullableoptional.<a href="/Sources/Resources/Nullableoptional/NullableoptionalClient.swift">listusers</a>(limit: Nullable&lt;Int&gt;?, offset: Nullable&lt;Int&gt;?, includeDeleted: Nullable&lt;Bool&gt;?, sortBy: Nullable&lt;String&gt;?, requestOptions: RequestOptions?) -> [UserResponse]</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

List all users
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

    _ = try await client.nullableoptional.listusers()
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

**limit:** `Nullable<Int>?` 
    
</dd>
</dl>

<dl>
<dd>

**offset:** `Nullable<Int>?` 
    
</dd>
</dl>

<dl>
<dd>

**includeDeleted:** `Nullable<Bool>?` 
    
</dd>
</dl>

<dl>
<dd>

**sortBy:** `Nullable<String>?` 
    
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

<details><summary><code>client.nullableoptional.<a href="/Sources/Resources/Nullableoptional/NullableoptionalClient.swift">createuser</a>(request: Requests.CreateUserRequest, requestOptions: RequestOptions?) -> UserResponse</code></summary>
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
import Api

private func main() async throws {
    let client = ApiClient()

    _ = try await client.nullableoptional.createuser(request: .init(
        username: "username",
        email: .null
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

<details><summary><code>client.nullableoptional.<a href="/Sources/Resources/Nullableoptional/NullableoptionalClient.swift">searchusers</a>(query: String, department: Nullable&lt;String&gt;, role: Nullable&lt;String&gt;?, isActive: Nullable&lt;Bool&gt;?, requestOptions: RequestOptions?) -> [UserResponse]</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Search users
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

    _ = try await client.nullableoptional.searchusers(
        query: "query",
        department: .value("department")
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

**query:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**department:** `Nullable<String>` 
    
</dd>
</dl>

<dl>
<dd>

**role:** `Nullable<String>?` 
    
</dd>
</dl>

<dl>
<dd>

**isActive:** `Nullable<Bool>?` 
    
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

<details><summary><code>client.nullableoptional.<a href="/Sources/Resources/Nullableoptional/NullableoptionalClient.swift">createcomplexprofile</a>(request: ComplexProfile, requestOptions: RequestOptions?) -> ComplexProfile</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Create a complex profile to test nullable enums and unions
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

    _ = try await client.nullableoptional.createcomplexprofile(request: ComplexProfile(
        id: "id",
        nullableRole: .admin,
        nullableStatus: .active,
        nullableNotification: NotificationMethod.notificationMethodZero(
            NotificationMethodZero(
                emailAddress: "emailAddress",
                subject: "subject",
                type: .email
            )
        ),
        nullableSearchResult: SearchResult.searchResultZero(
            SearchResultZero(
                id: "id",
                username: "username",
                email: .null,
                createdAt: try! Date("2024-01-15T09:30:00Z", strategy: .iso8601),
                updatedAt: .null,
                type: .user
            )
        ),
        nullableArray: .null,
        nullableListOfNullables: .null,
        nullableMapOfNullables: .null,
        nullableListOfUnions: .null
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

**request:** `ComplexProfile` 
    
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

<details><summary><code>client.nullableoptional.<a href="/Sources/Resources/Nullableoptional/NullableoptionalClient.swift">getcomplexprofile</a>(profileId: String, requestOptions: RequestOptions?) -> ComplexProfile</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Get a complex profile by ID
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

    _ = try await client.nullableoptional.getcomplexprofile(profileId: "profileId")
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

**profileId:** `String` 
    
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

<details><summary><code>client.nullableoptional.<a href="/Sources/Resources/Nullableoptional/NullableoptionalClient.swift">updatecomplexprofile</a>(profileId: String, request: Requests.NullableOptionalUpdateComplexProfileRequest, requestOptions: RequestOptions?) -> ComplexProfile</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Update complex profile to test nullable field updates
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

    _ = try await client.nullableoptional.updatecomplexprofile(
        profileId: "profileId",
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

**profileId:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**request:** `Requests.NullableOptionalUpdateComplexProfileRequest` 
    
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

<details><summary><code>client.nullableoptional.<a href="/Sources/Resources/Nullableoptional/NullableoptionalClient.swift">testdeserialization</a>(request: DeserializationTestRequest, requestOptions: RequestOptions?) -> DeserializationTestResponse</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Test endpoint for validating null deserialization
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

    _ = try await client.nullableoptional.testdeserialization(request: DeserializationTestRequest(
        requiredString: "requiredString",
        nullableString: .null,
        nullableEnum: .admin,
        nullableUnion: NotificationMethod.notificationMethodZero(
            NotificationMethodZero(
                emailAddress: "emailAddress",
                subject: "subject",
                type: .email
            )
        ),
        nullableList: .null,
        nullableMap: .null,
        nullableObject: Address(
            street: "street",
            city: .null,
            zipCode: "zipCode",
            buildingId: .null,
            tenantId: .null
        )
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

**request:** `DeserializationTestRequest` 
    
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

<details><summary><code>client.nullableoptional.<a href="/Sources/Resources/Nullableoptional/NullableoptionalClient.swift">filterbyrole</a>(role: UserRole, status: UserStatus?, secondaryRole: UserRole?, requestOptions: RequestOptions?) -> [UserResponse]</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Filter users by role with nullable enum
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

    _ = try await client.nullableoptional.filterbyrole(role: .admin)
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

**role:** `UserRole` 
    
</dd>
</dl>

<dl>
<dd>

**status:** `UserStatus?` 
    
</dd>
</dl>

<dl>
<dd>

**secondaryRole:** `UserRole?` 
    
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

<details><summary><code>client.nullableoptional.<a href="/Sources/Resources/Nullableoptional/NullableoptionalClient.swift">getnotificationsettings</a>(userId: String, requestOptions: RequestOptions?) -> NotificationMethod</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Get notification settings which may be null
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

    _ = try await client.nullableoptional.getnotificationsettings(userId: "userId")
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

<details><summary><code>client.nullableoptional.<a href="/Sources/Resources/Nullableoptional/NullableoptionalClient.swift">updatetags</a>(userId: String, request: Requests.NullableOptionalUpdateTagsRequest, requestOptions: RequestOptions?) -> [String]</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Update tags to test array handling
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

    _ = try await client.nullableoptional.updatetags(
        userId: "userId",
        request: .init(tags: .null)
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

**request:** `Requests.NullableOptionalUpdateTagsRequest` 
    
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

<details><summary><code>client.nullableoptional.<a href="/Sources/Resources/Nullableoptional/NullableoptionalClient.swift">getsearchresults</a>(request: Requests.NullableOptionalGetSearchResultsRequest, requestOptions: RequestOptions?) -> Nullable&lt;[SearchResult]&gt;</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Get search results with nullable unions
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

    _ = try await client.nullableoptional.getsearchresults(request: .init(
        query: "query",
        includeTypes: .null
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

**request:** `Requests.NullableOptionalGetSearchResultsRequest` 
    
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

