# Reference
## NullableOptional
<details><summary><code>client.nullableOptional.<a href="/src/api/resources/nullableOptional/client/Client.ts">getUser</a>(userId) -> SeedNullableOptional.UserResponse</code></summary>
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

```typescript
await client.nullableOptional.getUser("userId");

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

**userId:** `string` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `NullableOptional.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.nullableOptional.<a href="/src/api/resources/nullableOptional/client/Client.ts">createUser</a>({ ...params }) -> SeedNullableOptional.UserResponse</code></summary>
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

```typescript
await client.nullableOptional.createUser({
    username: "username",
    email: "email",
    phone: "phone",
    address: {
        street: "street",
        city: "city",
        state: "state",
        zipCode: "zipCode",
        country: "country",
        buildingId: "buildingId",
        tenantId: "tenantId"
    }
});

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

**request:** `SeedNullableOptional.CreateUserRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `NullableOptional.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.nullableOptional.<a href="/src/api/resources/nullableOptional/client/Client.ts">updateUser</a>(userId, { ...params }) -> SeedNullableOptional.UserResponse</code></summary>
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

```typescript
await client.nullableOptional.updateUser("userId", {
    username: "username",
    email: "email",
    phone: "phone",
    address: {
        street: "street",
        city: "city",
        state: "state",
        zipCode: "zipCode",
        country: "country",
        buildingId: "buildingId",
        tenantId: "tenantId"
    }
});

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

**userId:** `string` 
    
</dd>
</dl>

<dl>
<dd>

**request:** `SeedNullableOptional.UpdateUserRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `NullableOptional.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.nullableOptional.<a href="/src/api/resources/nullableOptional/client/Client.ts">listUsers</a>({ ...params }) -> SeedNullableOptional.UserResponse[]</code></summary>
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

```typescript
await client.nullableOptional.listUsers({
    limit: 1,
    offset: 1,
    includeDeleted: true,
    sortBy: "sortBy"
});

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

**request:** `SeedNullableOptional.ListUsersRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `NullableOptional.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.nullableOptional.<a href="/src/api/resources/nullableOptional/client/Client.ts">searchUsers</a>({ ...params }) -> SeedNullableOptional.UserResponse[]</code></summary>
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

```typescript
await client.nullableOptional.searchUsers({
    query: "query",
    department: "department",
    role: "role",
    isActive: true
});

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

**request:** `SeedNullableOptional.SearchUsersRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `NullableOptional.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.nullableOptional.<a href="/src/api/resources/nullableOptional/client/Client.ts">createComplexProfile</a>({ ...params }) -> SeedNullableOptional.ComplexProfile</code></summary>
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

```typescript
await client.nullableOptional.createComplexProfile({
    id: "id",
    nullableRole: "ADMIN",
    optionalRole: "ADMIN",
    optionalNullableRole: "ADMIN",
    nullableStatus: "active",
    optionalStatus: "active",
    optionalNullableStatus: "active",
    nullableNotification: {
        type: "email",
        emailAddress: "emailAddress",
        subject: "subject",
        htmlContent: "htmlContent"
    },
    optionalNotification: {
        type: "email",
        emailAddress: "emailAddress",
        subject: "subject",
        htmlContent: "htmlContent"
    },
    optionalNullableNotification: {
        type: "email",
        emailAddress: "emailAddress",
        subject: "subject",
        htmlContent: "htmlContent"
    },
    nullableSearchResult: {
        type: "user",
        id: "id",
        username: "username",
        email: "email",
        phone: "phone",
        createdAt: "2024-01-15T09:30:00Z",
        updatedAt: "2024-01-15T09:30:00Z",
        address: {
            street: "street",
            city: "city",
            state: "state",
            zipCode: "zipCode",
            country: "country",
            buildingId: "buildingId",
            tenantId: "tenantId"
        }
    },
    optionalSearchResult: {
        type: "user",
        id: "id",
        username: "username",
        email: "email",
        phone: "phone",
        createdAt: "2024-01-15T09:30:00Z",
        updatedAt: "2024-01-15T09:30:00Z",
        address: {
            street: "street",
            city: "city",
            state: "state",
            zipCode: "zipCode",
            country: "country",
            buildingId: "buildingId",
            tenantId: "tenantId"
        }
    },
    nullableArray: ["nullableArray", "nullableArray"],
    optionalArray: ["optionalArray", "optionalArray"],
    optionalNullableArray: ["optionalNullableArray", "optionalNullableArray"],
    nullableListOfNullables: ["nullableListOfNullables", "nullableListOfNullables"],
    nullableMapOfNullables: {
        "nullableMapOfNullables": {
            street: "street",
            city: "city",
            state: "state",
            zipCode: "zipCode",
            country: "country",
            buildingId: "buildingId",
            tenantId: "tenantId"
        }
    },
    nullableListOfUnions: [{
            type: "email",
            emailAddress: "emailAddress",
            subject: "subject",
            htmlContent: "htmlContent"
        }, {
            type: "email",
            emailAddress: "emailAddress",
            subject: "subject",
            htmlContent: "htmlContent"
        }],
    optionalMapOfEnums: {
        "optionalMapOfEnums": "ADMIN"
    }
});

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

**request:** `SeedNullableOptional.ComplexProfile` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `NullableOptional.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.nullableOptional.<a href="/src/api/resources/nullableOptional/client/Client.ts">getComplexProfile</a>(profileId) -> SeedNullableOptional.ComplexProfile</code></summary>
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

```typescript
await client.nullableOptional.getComplexProfile("profileId");

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

**profileId:** `string` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `NullableOptional.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.nullableOptional.<a href="/src/api/resources/nullableOptional/client/Client.ts">updateComplexProfile</a>(profileId, { ...params }) -> SeedNullableOptional.ComplexProfile</code></summary>
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

```typescript
await client.nullableOptional.updateComplexProfile("profileId", {
    nullableRole: "ADMIN",
    nullableStatus: "active",
    nullableNotification: {
        type: "email",
        emailAddress: "emailAddress",
        subject: "subject",
        htmlContent: "htmlContent"
    },
    nullableSearchResult: {
        type: "user",
        id: "id",
        username: "username",
        email: "email",
        phone: "phone",
        createdAt: "2024-01-15T09:30:00Z",
        updatedAt: "2024-01-15T09:30:00Z",
        address: {
            street: "street",
            city: "city",
            state: "state",
            zipCode: "zipCode",
            country: "country",
            buildingId: "buildingId",
            tenantId: "tenantId"
        }
    },
    nullableArray: ["nullableArray", "nullableArray"]
});

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

**profileId:** `string` 
    
</dd>
</dl>

<dl>
<dd>

**request:** `SeedNullableOptional.UpdateComplexProfileRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `NullableOptional.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.nullableOptional.<a href="/src/api/resources/nullableOptional/client/Client.ts">testDeserialization</a>({ ...params }) -> SeedNullableOptional.DeserializationTestResponse</code></summary>
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

```typescript
await client.nullableOptional.testDeserialization({
    requiredString: "requiredString",
    nullableString: "nullableString",
    optionalString: "optionalString",
    optionalNullableString: "optionalNullableString",
    nullableEnum: "ADMIN",
    optionalEnum: "active",
    nullableUnion: {
        type: "email",
        emailAddress: "emailAddress",
        subject: "subject",
        htmlContent: "htmlContent"
    },
    optionalUnion: {
        type: "user",
        id: "id",
        username: "username",
        email: "email",
        phone: "phone",
        createdAt: "2024-01-15T09:30:00Z",
        updatedAt: "2024-01-15T09:30:00Z",
        address: {
            street: "street",
            city: "city",
            state: "state",
            zipCode: "zipCode",
            country: "country",
            buildingId: "buildingId",
            tenantId: "tenantId"
        }
    },
    nullableList: ["nullableList", "nullableList"],
    nullableMap: {
        "nullableMap": 1
    },
    nullableObject: {
        street: "street",
        city: "city",
        state: "state",
        zipCode: "zipCode",
        country: "country",
        buildingId: "buildingId",
        tenantId: "tenantId"
    },
    optionalObject: {
        id: "id",
        name: "name",
        domain: "domain",
        employeeCount: 1
    }
});

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

**request:** `SeedNullableOptional.DeserializationTestRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `NullableOptional.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.nullableOptional.<a href="/src/api/resources/nullableOptional/client/Client.ts">filterByRole</a>({ ...params }) -> SeedNullableOptional.UserResponse[]</code></summary>
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

```typescript
await client.nullableOptional.filterByRole({
    role: "ADMIN",
    status: "active",
    secondaryRole: "ADMIN"
});

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

**request:** `SeedNullableOptional.FilterByRoleRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `NullableOptional.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.nullableOptional.<a href="/src/api/resources/nullableOptional/client/Client.ts">getNotificationSettings</a>(userId) -> SeedNullableOptional.NotificationMethod | null</code></summary>
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

```typescript
await client.nullableOptional.getNotificationSettings("userId");

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

**userId:** `string` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `NullableOptional.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.nullableOptional.<a href="/src/api/resources/nullableOptional/client/Client.ts">updateTags</a>(userId, { ...params }) -> string[]</code></summary>
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

```typescript
await client.nullableOptional.updateTags("userId", {
    tags: ["tags", "tags"],
    categories: ["categories", "categories"],
    labels: ["labels", "labels"]
});

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

**userId:** `string` 
    
</dd>
</dl>

<dl>
<dd>

**request:** `SeedNullableOptional.UpdateTagsRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `NullableOptional.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.nullableOptional.<a href="/src/api/resources/nullableOptional/client/Client.ts">getSearchResults</a>({ ...params }) -> SeedNullableOptional.SearchResult[] | null</code></summary>
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

```typescript
await client.nullableOptional.getSearchResults({
    query: "query",
    filters: {
        "filters": "filters"
    },
    includeTypes: ["includeTypes", "includeTypes"]
});

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

**request:** `SeedNullableOptional.SearchRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `NullableOptional.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>
