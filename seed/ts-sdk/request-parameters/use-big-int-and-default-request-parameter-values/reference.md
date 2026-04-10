# Reference
## User
<details><summary><code>client.user.<a href="/src/api/resources/user/client/Client.ts">createusername</a>({ ...params }) -> void</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.user.createusername({
    tags: "tags",
    username: "username",
    password: "password",
    name: "name"
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

**request:** `SeedApi.UserCreateUsernameRequest` 
    
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

<details><summary><code>client.user.<a href="/src/api/resources/user/client/Client.ts">createusernamewithreferencedtype</a>({ ...params }) -> void</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.user.createusernamewithreferencedtype({
    tags: "tags",
    username: "username",
    password: "password",
    name: "name"
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

**request:** `SeedApi.CreateUsernameBody` 
    
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

<details><summary><code>client.user.<a href="/src/api/resources/user/client/Client.ts">createusernameoptional</a>({ ...params }) -> void</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.user.createusernameoptional();

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

**request:** `SeedApi.CreateUsernameBodyOptionalProperties` 
    
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

<details><summary><code>client.user.<a href="/src/api/resources/user/client/Client.ts">getusername</a>({ ...params }) -> SeedApi.User</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.user.getusername({
    limit: 1,
    id: "id",
    date: "2023-01-15",
    deadline: "2024-01-15T09:30:00Z",
    bytes: "bytes",
    user: {
        name: "name",
        tags: ["tags", "tags"]
    },
    userList: {
        name: "name",
        tags: ["tags", "tags"]
    },
    optionalDeadline: "2024-01-15T09:30:00Z",
    keyValue: {
        "keyValue": "keyValue"
    },
    optionalString: "optionalString",
    nestedUser: {
        name: "name",
        user: {
            name: "name",
            tags: ["tags", "tags"]
        }
    },
    optionalUser: {
        name: "name",
        tags: ["tags", "tags"]
    },
    excludeUser: {
        name: "name",
        tags: ["tags", "tags"]
    },
    filter: "filter",
    longParam: BigInt("1000000"),
    bigIntParam: 1
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

**request:** `SeedApi.UserGetUsernameRequest` 
    
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

