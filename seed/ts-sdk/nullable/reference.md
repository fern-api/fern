# Reference

## Nullable

<details><summary><code>client.nullable.<a href="/src/api/resources/nullable/client/Client.ts">getUsers</a>({ ...params }) -> SeedNullable.User[]</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.nullable.getUsers({
    usernames: "usernames",
    avatar: "avatar",
    activated: true,
    tags: null,
    extra: null,
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

**request:** `SeedNullable.GetUsersRequest`

</dd>
</dl>

<dl>
<dd>

**requestOptions:** `Nullable.RequestOptions`

</dd>
</dl>
</dd>
</dl>

</dd>
</dl>
</details>

<details><summary><code>client.nullable.<a href="/src/api/resources/nullable/client/Client.ts">createUser</a>({ ...params }) -> SeedNullable.User</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.nullable.createUser({
    username: "username",
    tags: ["tags", "tags"],
    metadata: {
        createdAt: "2024-01-15T09:30:00Z",
        updatedAt: "2024-01-15T09:30:00Z",
        avatar: "avatar",
        activated: true,
    },
    avatar: "avatar",
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

**request:** `SeedNullable.CreateUserRequest`

</dd>
</dl>

<dl>
<dd>

**requestOptions:** `Nullable.RequestOptions`

</dd>
</dl>
</dd>
</dl>

</dd>
</dl>
</details>

<details><summary><code>client.nullable.<a href="/src/api/resources/nullable/client/Client.ts">deleteUser</a>({ ...params }) -> boolean</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.nullable.deleteUser({
    username: "xy",
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

**request:** `SeedNullable.DeleteUserRequest`

</dd>
</dl>

<dl>
<dd>

**requestOptions:** `Nullable.RequestOptions`

</dd>
</dl>
</dd>
</dl>

</dd>
</dl>
</details>
