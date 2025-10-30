# Reference
## NullableOptional
<details><summary><code>client.nullableOptional.<a href="/Sources/Resources/NullableOptional/NullableOptionalClient_.swift">getUser</a>(userId: String, requestOptions: RequestOptions?) -> UserResponse</code></summary>
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
import NullableOptional

private func main() async throws {
    let client = NullableOptionalClient()

    _ = try await client.nullableOptional.getUser(userId: "userId")
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

<details><summary><code>client.nullableOptional.<a href="/Sources/Resources/NullableOptional/NullableOptionalClient_.swift">createUser</a>(request: CreateUserRequest, requestOptions: RequestOptions?) -> UserResponse</code></summary>
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
import NullableOptional

private func main() async throws {
    let client = NullableOptionalClient()

    _ = try await client.nullableOptional.createUser(request: CreateUserRequest(
        username: "username",
        email: "email",
        phone: "phone",
        address: Address(
            street: "street",
            city: "city",
            state: "state",
            zipCode: "zipCode",
            country: "country",
            buildingId: "buildingId",
            tenantId: "tenantId"
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

<details><summary><code>client.nullableOptional.<a href="/Sources/Resources/NullableOptional/NullableOptionalClient_.swift">updateUser</a>(userId: String, request: UpdateUserRequest, requestOptions: RequestOptions?) -> UserResponse</code></summary>
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
import NullableOptional

private func main() async throws {
    let client = NullableOptionalClient()

    _ = try await client.nullableOptional.updateUser(
        userId: "userId",
        request: UpdateUserRequest(
            username: "username",
            email: "email",
            phone: "phone",
            address: Address(
                street: "street",
                city: "city",
                state: "state",
                zipCode: "zipCode",
                country: "country",
                buildingId: "buildingId",
                tenantId: "tenantId"
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

<details><summary><code>client.nullableOptional.<a href="/Sources/Resources/NullableOptional/NullableOptionalClient_.swift">listUsers</a>(limit: Int?, offset: Int?, includeDeleted: Bool?, sortBy: String?, requestOptions: RequestOptions?) -> [UserResponse]</code></summary>
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
import NullableOptional

private func main() async throws {
    let client = NullableOptionalClient()

    _ = try await client.nullableOptional.listUsers(
        limit: 1,
        offset: 1,
        includeDeleted: true,
        sortBy: "sortBy"
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

**limit:** `Int?` 
    
</dd>
</dl>

<dl>
<dd>

**offset:** `Int?` 
    
</dd>
</dl>

<dl>
<dd>

**includeDeleted:** `Bool?` 
    
</dd>
</dl>

<dl>
<dd>

**sortBy:** `String?` 
    
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

<details><summary><code>client.nullableOptional.<a href="/Sources/Resources/NullableOptional/NullableOptionalClient_.swift">searchUsers</a>(query: String, department: String?, role: String?, isActive: Bool?, requestOptions: RequestOptions?) -> [UserResponse]</code></summary>
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
import NullableOptional

private func main() async throws {
    let client = NullableOptionalClient()

    _ = try await client.nullableOptional.searchUsers(
        query: "query",
        department: "department",
        role: "role",
        isActive: true
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

**department:** `String?` 
    
</dd>
</dl>

<dl>
<dd>

**role:** `String?` 
    
</dd>
</dl>

<dl>
<dd>

**isActive:** `Bool?` 
    
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

<details><summary><code>client.nullableOptional.<a href="/Sources/Resources/NullableOptional/NullableOptionalClient_.swift">createComplexProfile</a>(request: ComplexProfile, requestOptions: RequestOptions?) -> ComplexProfile</code></summary>
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
import NullableOptional

private func main() async throws {
    let client = NullableOptionalClient()

    _ = try await client.nullableOptional.createComplexProfile(request: ComplexProfile(
        id: "id",
        nullableRole: .admin,
        optionalRole: .admin,
        optionalNullableRole: .admin,
        nullableStatus: .active,
        optionalStatus: .active,
        optionalNullableStatus: .active,
        nullableNotification: NotificationMethod.email(
            .init(
                emailAddress: "emailAddress",
                subject: "subject",
                htmlContent: "htmlContent"
            )
        ),
        optionalNotification: NotificationMethod.email(
            .init(
                emailAddress: "emailAddress",
                subject: "subject",
                htmlContent: "htmlContent"
            )
        ),
        optionalNullableNotification: NotificationMethod.email(
            .init(
                emailAddress: "emailAddress",
                subject: "subject",
                htmlContent: "htmlContent"
            )
        ),
        nullableSearchResult: SearchResult.user(
            .init(
                id: "id",
                username: "username",
                email: "email",
                phone: "phone",
                createdAt: try! Date("2024-01-15T09:30:00Z", strategy: .iso8601),
                updatedAt: try! Date("2024-01-15T09:30:00Z", strategy: .iso8601),
                address: Address(
                    street: "street",
                    city: "city",
                    state: "state",
                    zipCode: "zipCode",
                    country: "country",
                    buildingId: "buildingId",
                    tenantId: "tenantId"
                )
            )
        ),
        optionalSearchResult: SearchResult.user(
            .init(
                id: "id",
                username: "username",
                email: "email",
                phone: "phone",
                createdAt: try! Date("2024-01-15T09:30:00Z", strategy: .iso8601),
                updatedAt: try! Date("2024-01-15T09:30:00Z", strategy: .iso8601),
                address: Address(
                    street: "street",
                    city: "city",
                    state: "state",
                    zipCode: "zipCode",
                    country: "country",
                    buildingId: "buildingId",
                    tenantId: "tenantId"
                )
            )
        ),
        nullableArray: [
            "nullableArray",
            "nullableArray"
        ],
        optionalArray: [
            "optionalArray",
            "optionalArray"
        ],
        optionalNullableArray: [
            "optionalNullableArray",
            "optionalNullableArray"
        ],
        nullableListOfNullables: [
            "nullableListOfNullables",
            "nullableListOfNullables"
        ],
        nullableMapOfNullables: [
            "nullableMapOfNullables": Address(
                street: "street",
                city: "city",
                state: "state",
                zipCode: "zipCode",
                country: "country",
                buildingId: "buildingId",
                tenantId: "tenantId"
            )
        ],
        nullableListOfUnions: [
            NotificationMethod.email(
                .init(
                    emailAddress: "emailAddress",
                    subject: "subject",
                    htmlContent: "htmlContent"
                )
            ),
            NotificationMethod.email(
                .init(
                    emailAddress: "emailAddress",
                    subject: "subject",
                    htmlContent: "htmlContent"
                )
            )
        ],
        optionalMapOfEnums: [
            "optionalMapOfEnums": .admin
        ]
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

<details><summary><code>client.nullableOptional.<a href="/Sources/Resources/NullableOptional/NullableOptionalClient_.swift">getComplexProfile</a>(profileId: String, requestOptions: RequestOptions?) -> ComplexProfile</code></summary>
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
import NullableOptional

private func main() async throws {
    let client = NullableOptionalClient()

    _ = try await client.nullableOptional.getComplexProfile(profileId: "profileId")
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

<details><summary><code>client.nullableOptional.<a href="/Sources/Resources/NullableOptional/NullableOptionalClient_.swift">updateComplexProfile</a>(profileId: String, request: Requests.UpdateComplexProfileRequest, requestOptions: RequestOptions?) -> ComplexProfile</code></summary>
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
import NullableOptional

private func main() async throws {
    let client = NullableOptionalClient()

    _ = try await client.nullableOptional.updateComplexProfile(
        profileId: "profileId",
        request: .init(
            nullableRole: .admin,
            nullableStatus: .active,
            nullableNotification: NotificationMethod.email(
                .init(
                    emailAddress: "emailAddress",
                    subject: "subject",
                    htmlContent: "htmlContent"
                )
            ),
            nullableSearchResult: SearchResult.user(
                .init(
                    id: "id",
                    username: "username",
                    email: "email",
                    phone: "phone",
                    createdAt: try! Date("2024-01-15T09:30:00Z", strategy: .iso8601),
                    updatedAt: try! Date("2024-01-15T09:30:00Z", strategy: .iso8601),
                    address: Address(
                        street: "street",
                        city: "city",
                        state: "state",
                        zipCode: "zipCode",
                        country: "country",
                        buildingId: "buildingId",
                        tenantId: "tenantId"
                    )
                )
            ),
            nullableArray: [
                "nullableArray",
                "nullableArray"
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

**profileId:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**request:** `Requests.UpdateComplexProfileRequest` 
    
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

<details><summary><code>client.nullableOptional.<a href="/Sources/Resources/NullableOptional/NullableOptionalClient_.swift">testDeserialization</a>(request: DeserializationTestRequest, requestOptions: RequestOptions?) -> DeserializationTestResponse</code></summary>
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
import NullableOptional

private func main() async throws {
    let client = NullableOptionalClient()

    _ = try await client.nullableOptional.testDeserialization(request: DeserializationTestRequest(
        requiredString: "requiredString",
        nullableString: "nullableString",
        optionalString: "optionalString",
        optionalNullableString: "optionalNullableString",
        nullableEnum: .admin,
        optionalEnum: .active,
        nullableUnion: NotificationMethod.email(
            .init(
                emailAddress: "emailAddress",
                subject: "subject",
                htmlContent: "htmlContent"
            )
        ),
        optionalUnion: SearchResult.user(
            .init(
                id: "id",
                username: "username",
                email: "email",
                phone: "phone",
                createdAt: try! Date("2024-01-15T09:30:00Z", strategy: .iso8601),
                updatedAt: try! Date("2024-01-15T09:30:00Z", strategy: .iso8601),
                address: Address(
                    street: "street",
                    city: "city",
                    state: "state",
                    zipCode: "zipCode",
                    country: "country",
                    buildingId: "buildingId",
                    tenantId: "tenantId"
                )
            )
        ),
        nullableList: [
            "nullableList",
            "nullableList"
        ],
        nullableMap: [
            "nullableMap": 1
        ],
        nullableObject: Address(
            street: "street",
            city: "city",
            state: "state",
            zipCode: "zipCode",
            country: "country",
            buildingId: "buildingId",
            tenantId: "tenantId"
        ),
        optionalObject: Organization(
            id: "id",
            name: "name",
            domain: "domain",
            employeeCount: 1
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

<details><summary><code>client.nullableOptional.<a href="/Sources/Resources/NullableOptional/NullableOptionalClient_.swift">filterByRole</a>(role: UserRole?, status: UserStatus?, secondaryRole: UserRole?, requestOptions: RequestOptions?) -> [UserResponse]</code></summary>
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
import NullableOptional

private func main() async throws {
    let client = NullableOptionalClient()

    _ = try await client.nullableOptional.filterByRole(
        role: .admin,
        status: .active,
        secondaryRole: .admin
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

**role:** `UserRole?` 
    
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

<details><summary><code>client.nullableOptional.<a href="/Sources/Resources/NullableOptional/NullableOptionalClient_.swift">getNotificationSettings</a>(userId: String, requestOptions: RequestOptions?) -> NotificationMethod?</code></summary>
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
import NullableOptional

private func main() async throws {
    let client = NullableOptionalClient()

    _ = try await client.nullableOptional.getNotificationSettings(userId: "userId")
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

<details><summary><code>client.nullableOptional.<a href="/Sources/Resources/NullableOptional/NullableOptionalClient_.swift">updateTags</a>(userId: String, request: Requests.UpdateTagsRequest, requestOptions: RequestOptions?) -> [String]</code></summary>
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
import NullableOptional

private func main() async throws {
    let client = NullableOptionalClient()

    _ = try await client.nullableOptional.updateTags(
        userId: "userId",
        request: .init(
            tags: [
                "tags",
                "tags"
            ],
            categories: [
                "categories",
                "categories"
            ],
            labels: [
                "labels",
                "labels"
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

**userId:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**request:** `Requests.UpdateTagsRequest` 
    
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

<details><summary><code>client.nullableOptional.<a href="/Sources/Resources/NullableOptional/NullableOptionalClient_.swift">getSearchResults</a>(request: Requests.SearchRequest, requestOptions: RequestOptions?) -> [SearchResult]?</code></summary>
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
import NullableOptional

private func main() async throws {
    let client = NullableOptionalClient()

    _ = try await client.nullableOptional.getSearchResults(request: .init(
        query: "query",
        filters: [
            "filters": "filters"
        ],
        includeTypes: [
            "includeTypes",
            "includeTypes"
        ]
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

