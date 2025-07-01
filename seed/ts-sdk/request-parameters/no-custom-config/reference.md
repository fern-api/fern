# Reference

## User

<details><summary><code>client.user.<a href="/src/api/resources/user/client/Client.ts">createUsername</a>({ ...params }) -> void</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.user.createUsername({
    username: "username",
    password: "password",
    name: "test",
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

**request:** `SeedRequestParameters.CreateUsernameRequest`

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

<details><summary><code>client.user.<a href="/src/api/resources/user/client/Client.ts">getUsername</a>({ ...params }) -> SeedRequestParameters.User</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.user.getUsername({
    limit: 1,
    id: "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32",
    date: "2023-01-15",
    deadline: "2024-01-15T09:30:00Z",
    bytes: "SGVsbG8gd29ybGQh",
    user: {
        name: "name",
        tags: ["tags", "tags"],
    },
    userList: [
        {
            name: "name",
            tags: ["tags", "tags"],
        },
        {
            name: "name",
            tags: ["tags", "tags"],
        },
    ],
    optionalDeadline: "2024-01-15T09:30:00Z",
    keyValue: {
        keyValue: "keyValue",
    },
    optionalString: "optionalString",
    nestedUser: {
        name: "name",
        user: {
            name: "name",
            tags: ["tags", "tags"],
        },
    },
    optionalUser: {
        name: "name",
        tags: ["tags", "tags"],
    },
    excludeUser: {
        name: "name",
        tags: ["tags", "tags"],
    },
    filter: "filter",
    longParam: 1000000,
    bigIntParam: "1000000",
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

**request:** `SeedRequestParameters.GetUsersRequest`

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
