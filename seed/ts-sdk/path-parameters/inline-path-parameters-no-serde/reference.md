# Reference

## Organizations

<details><summary><code>client.organizations.<a href="/src/api/resources/organizations/client/Client.ts">getOrganization</a>(organizationId) -> SeedPathParameters.Organization</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.organizations.getOrganization("organization_id");
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

**organizationId:** `string`

</dd>
</dl>

<dl>
<dd>

**requestOptions:** `Organizations.RequestOptions`

</dd>
</dl>
</dd>
</dl>

</dd>
</dl>
</details>

<details><summary><code>client.organizations.<a href="/src/api/resources/organizations/client/Client.ts">getOrganizationUser</a>({ ...params }) -> SeedPathParameters.User</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.organizations.getOrganizationUser({
    organization_id: "organization_id",
    user_id: "user_id",
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

**request:** `SeedPathParameters.GetOrganizationUserRequest`

</dd>
</dl>

<dl>
<dd>

**requestOptions:** `Organizations.RequestOptions`

</dd>
</dl>
</dd>
</dl>

</dd>
</dl>
</details>

<details><summary><code>client.organizations.<a href="/src/api/resources/organizations/client/Client.ts">searchOrganizations</a>(organizationId, { ...params }) -> SeedPathParameters.Organization[]</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.organizations.searchOrganizations("organization_id", {
    limit: 1,
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

**organizationId:** `string`

</dd>
</dl>

<dl>
<dd>

**request:** `SeedPathParameters.SearchOrganizationsRequest`

</dd>
</dl>

<dl>
<dd>

**requestOptions:** `Organizations.RequestOptions`

</dd>
</dl>
</dd>
</dl>

</dd>
</dl>
</details>

## User

<details><summary><code>client.user.<a href="/src/api/resources/user/client/Client.ts">getUser</a>({ ...params }) -> SeedPathParameters.User</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.user.getUser({
    user_id: "user_id",
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

**request:** `SeedPathParameters.GetUsersRequest`

</dd>
</dl>

<dl>
<dd>

**requestOptions:** `User.RequestOptions`

</dd>
</dl>
</dd>
</dl>

</dd>
</dl>
</details>

<details><summary><code>client.user.<a href="/src/api/resources/user/client/Client.ts">createUser</a>({ ...params }) -> SeedPathParameters.User</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.user.createUser({
    name: "name",
    tags: ["tags", "tags"],
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

**request:** `SeedPathParameters.User`

</dd>
</dl>

<dl>
<dd>

**requestOptions:** `User.RequestOptions`

</dd>
</dl>
</dd>
</dl>

</dd>
</dl>
</details>

<details><summary><code>client.user.<a href="/src/api/resources/user/client/Client.ts">updateUser</a>({ ...params }) -> SeedPathParameters.User</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.user.updateUser({
    user_id: "user_id",
    body: {
        name: "name",
        tags: ["tags", "tags"],
    },
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

**request:** `SeedPathParameters.UpdateUserRequest`

</dd>
</dl>

<dl>
<dd>

**requestOptions:** `User.RequestOptions`

</dd>
</dl>
</dd>
</dl>

</dd>
</dl>
</details>

<details><summary><code>client.user.<a href="/src/api/resources/user/client/Client.ts">searchUsers</a>({ ...params }) -> SeedPathParameters.User[]</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.user.searchUsers({
    user_id: "user_id",
    limit: 1,
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

**request:** `SeedPathParameters.SearchUsersRequest`

</dd>
</dl>

<dl>
<dd>

**requestOptions:** `User.RequestOptions`

</dd>
</dl>
</dd>
</dl>

</dd>
</dl>
</details>
