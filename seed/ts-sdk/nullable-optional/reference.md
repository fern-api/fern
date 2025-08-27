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
    sortBy: "sortBy",
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
    isActive: true,
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
