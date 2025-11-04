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
    tags: "tags",
    extra: true
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

**request:** `GetUsersRequest` 
    
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
        status: {
            type: "active"
        },
        values: {
            "values": "values"
        }
    },
    avatar: "avatar"
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

**request:** `CreateUserRequest` 
    
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
    username: "xy"
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

**request:** `DeleteUserRequest` 
    
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
