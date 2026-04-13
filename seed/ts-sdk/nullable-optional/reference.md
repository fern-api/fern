# Reference
## Nullableoptional
<details><summary><code>client.nullableoptional.<a href="/src/api/resources/nullableoptional/client/Client.ts">getuser</a>({ ...params }) -> SeedApi.UserResponse</code></summary>
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
await client.nullableoptional.getuser({
    userId: "userId"
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

**request:** `SeedApi.NullableOptionalGetUserRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `NullableoptionalClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.nullableoptional.<a href="/src/api/resources/nullableoptional/client/Client.ts">updateuser</a>({ ...params }) -> SeedApi.UserResponse</code></summary>
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
await client.nullableoptional.updateuser({
    userId: "userId"
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

**request:** `SeedApi.UpdateUserRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `NullableoptionalClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.nullableoptional.<a href="/src/api/resources/nullableoptional/client/Client.ts">listusers</a>({ ...params }) -> SeedApi.UserResponse[]</code></summary>
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
await client.nullableoptional.listusers();

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

**request:** `SeedApi.NullableOptionalListUsersRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `NullableoptionalClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.nullableoptional.<a href="/src/api/resources/nullableoptional/client/Client.ts">createuser</a>({ ...params }) -> SeedApi.UserResponse</code></summary>
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
await client.nullableoptional.createuser({
    username: "username"
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

**request:** `SeedApi.CreateUserRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `NullableoptionalClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.nullableoptional.<a href="/src/api/resources/nullableoptional/client/Client.ts">searchusers</a>({ ...params }) -> SeedApi.UserResponse[]</code></summary>
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
await client.nullableoptional.searchusers({
    query: "query",
    department: "department"
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

**request:** `SeedApi.NullableOptionalSearchUsersRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `NullableoptionalClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.nullableoptional.<a href="/src/api/resources/nullableoptional/client/Client.ts">createcomplexprofile</a>({ ...params }) -> SeedApi.ComplexProfile</code></summary>
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
await client.nullableoptional.createcomplexprofile({
    id: "id",
    nullableRole: "ADMIN",
    nullableStatus: "active",
    nullableNotification: {
        emailAddress: "emailAddress",
        subject: "subject",
        type: "email"
    },
    nullableSearchResult: {
        id: "id",
        username: "username",
        createdAt: "2024-01-15T09:30:00Z",
        type: "user"
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

**request:** `SeedApi.ComplexProfile` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `NullableoptionalClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.nullableoptional.<a href="/src/api/resources/nullableoptional/client/Client.ts">getcomplexprofile</a>({ ...params }) -> SeedApi.ComplexProfile</code></summary>
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
await client.nullableoptional.getcomplexprofile({
    profileId: "profileId"
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

**request:** `SeedApi.NullableOptionalGetComplexProfileRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `NullableoptionalClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.nullableoptional.<a href="/src/api/resources/nullableoptional/client/Client.ts">updatecomplexprofile</a>({ ...params }) -> SeedApi.ComplexProfile</code></summary>
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
await client.nullableoptional.updatecomplexprofile({
    profileId: "profileId"
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

**request:** `SeedApi.NullableOptionalUpdateComplexProfileRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `NullableoptionalClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.nullableoptional.<a href="/src/api/resources/nullableoptional/client/Client.ts">testdeserialization</a>({ ...params }) -> SeedApi.DeserializationTestResponse</code></summary>
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
await client.nullableoptional.testdeserialization({
    requiredString: "requiredString",
    nullableEnum: "ADMIN",
    nullableUnion: {
        emailAddress: "emailAddress",
        subject: "subject",
        type: "email"
    },
    nullableObject: {
        street: "street",
        zipCode: "zipCode"
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

**request:** `SeedApi.DeserializationTestRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `NullableoptionalClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.nullableoptional.<a href="/src/api/resources/nullableoptional/client/Client.ts">filterbyrole</a>({ ...params }) -> SeedApi.UserResponse[]</code></summary>
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
await client.nullableoptional.filterbyrole({
    role: "ADMIN"
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

**request:** `SeedApi.NullableOptionalFilterByRoleRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `NullableoptionalClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.nullableoptional.<a href="/src/api/resources/nullableoptional/client/Client.ts">getnotificationsettings</a>({ ...params }) -> SeedApi.NotificationMethod</code></summary>
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
await client.nullableoptional.getnotificationsettings({
    userId: "userId"
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

**request:** `SeedApi.NullableOptionalGetNotificationSettingsRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `NullableoptionalClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.nullableoptional.<a href="/src/api/resources/nullableoptional/client/Client.ts">updatetags</a>({ ...params }) -> string[]</code></summary>
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
await client.nullableoptional.updatetags({
    userId: "userId"
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

**request:** `SeedApi.NullableOptionalUpdateTagsRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `NullableoptionalClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.nullableoptional.<a href="/src/api/resources/nullableoptional/client/Client.ts">getsearchresults</a>({ ...params }) -> SeedApi.SearchResult[] | null</code></summary>
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
await client.nullableoptional.getsearchresults({
    query: "query"
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

**request:** `SeedApi.NullableOptionalGetSearchResultsRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `NullableoptionalClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

