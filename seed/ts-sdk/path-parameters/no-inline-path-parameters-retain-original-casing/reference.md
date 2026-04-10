# Reference
## Organizations
<details><summary><code>client.organizations.<a href="/src/api/resources/organizations/client/Client.ts">getorganization</a>(tenant_id, organization_id, { ...params }) -> SeedApi.Organization</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.organizations.getorganization("tenant_id", "organization_id");

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

**tenant_id:** `string` 
    
</dd>
</dl>

<dl>
<dd>

**organization_id:** `string` 
    
</dd>
</dl>

<dl>
<dd>

**request:** `SeedApi.OrganizationsGetOrganizationRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `OrganizationsClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.organizations.<a href="/src/api/resources/organizations/client/Client.ts">getorganizationuser</a>(tenant_id, organization_id, user_id, { ...params }) -> SeedApi.User</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.organizations.getorganizationuser("tenant_id", "organization_id", "user_id");

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

**tenant_id:** `string` 
    
</dd>
</dl>

<dl>
<dd>

**organization_id:** `string` 
    
</dd>
</dl>

<dl>
<dd>

**user_id:** `string` 
    
</dd>
</dl>

<dl>
<dd>

**request:** `SeedApi.OrganizationsGetOrganizationUserRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `OrganizationsClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.organizations.<a href="/src/api/resources/organizations/client/Client.ts">searchorganizations</a>(tenant_id, organization_id, { ...params }) -> SeedApi.Organization[]</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.organizations.searchorganizations("tenant_id", "organization_id");

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

**tenant_id:** `string` 
    
</dd>
</dl>

<dl>
<dd>

**organization_id:** `string` 
    
</dd>
</dl>

<dl>
<dd>

**request:** `SeedApi.OrganizationsSearchOrganizationsRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `OrganizationsClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## User
<details><summary><code>client.user.<a href="/src/api/resources/user/client/Client.ts">getuser</a>(tenant_id, user_id, { ...params }) -> SeedApi.User</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.user.getuser("tenant_id", "user_id");

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

**tenant_id:** `string` 
    
</dd>
</dl>

<dl>
<dd>

**user_id:** `string` 
    
</dd>
</dl>

<dl>
<dd>

**request:** `SeedApi.UserGetUserRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `UserClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.user.<a href="/src/api/resources/user/client/Client.ts">updateuser</a>(tenant_id, user_id, { ...params }) -> SeedApi.User</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.user.updateuser("tenant_id", "user_id", {
    body: {
        name: "name",
        tags: ["tags"]
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

**tenant_id:** `string` 
    
</dd>
</dl>

<dl>
<dd>

**user_id:** `string` 
    
</dd>
</dl>

<dl>
<dd>

**request:** `SeedApi.UserUpdateUserRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `UserClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.user.<a href="/src/api/resources/user/client/Client.ts">createuser</a>(tenant_id, { ...params }) -> SeedApi.User</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.user.createuser("tenant_id", {
    body: {
        name: "name",
        tags: ["tags"]
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

**tenant_id:** `string` 
    
</dd>
</dl>

<dl>
<dd>

**request:** `SeedApi.UserCreateUserRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `UserClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.user.<a href="/src/api/resources/user/client/Client.ts">searchusers</a>(tenant_id, user_id, { ...params }) -> SeedApi.User[]</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.user.searchusers("tenant_id", "user_id");

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

**tenant_id:** `string` 
    
</dd>
</dl>

<dl>
<dd>

**user_id:** `string` 
    
</dd>
</dl>

<dl>
<dd>

**request:** `SeedApi.UserSearchUsersRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `UserClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.user.<a href="/src/api/resources/user/client/Client.ts">getusermetadata</a>(tenant_id, user_id, version, { ...params }) -> SeedApi.User</code></summary>
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

```typescript
await client.user.getusermetadata("tenant_id", "user_id", 1);

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

**tenant_id:** `string` 
    
</dd>
</dl>

<dl>
<dd>

**user_id:** `string` 
    
</dd>
</dl>

<dl>
<dd>

**version:** `number` 
    
</dd>
</dl>

<dl>
<dd>

**request:** `SeedApi.UserGetUserMetadataRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `UserClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.user.<a href="/src/api/resources/user/client/Client.ts">getuserspecifics</a>(tenant_id, user_id, version, thought, { ...params }) -> SeedApi.User</code></summary>
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

```typescript
await client.user.getuserspecifics("tenant_id", "user_id", 1, "thought");

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

**tenant_id:** `string` 
    
</dd>
</dl>

<dl>
<dd>

**user_id:** `string` 
    
</dd>
</dl>

<dl>
<dd>

**version:** `number` 
    
</dd>
</dl>

<dl>
<dd>

**thought:** `string` 
    
</dd>
</dl>

<dl>
<dd>

**request:** `SeedApi.UserGetUserSpecificsRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `UserClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

