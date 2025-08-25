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
    tags: ["tags", "tags"],
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

<details><summary><code>client.user.<a href="/src/api/resources/user/client/Client.ts">createUsernameWithReferencedType</a>({ ...params }) -> void</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.user.createUsernameWithReferencedType({
    tags: ["tags", "tags"],
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

**request:** `SeedRequestParameters.CreateUsernameReferencedRequest`

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

<details><summary><code>client.user.<a href="/src/api/resources/user/client/Client.ts">createAgent</a>({ ...params }) -> SeedRequestParameters.AgentsCreateResponse</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Creates a new agent in a project.

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
await client.user.createAgent({
    project: "main",
    audio_speed: 1,
    boosted_keywords: ["Load ID", "dispatch"],
    configuration_endpoint: {
        headers: {
            Authorization: "Bearer token123",
        },
        timeout_ms: 7000,
        url: "https://api.example.com/config",
    },
    name: "support-agent",
    no_input_poke_sec: 30,
    no_input_poke_text: "Are you still there?",
    phone_number: "assign-automatically",
    system_prompt: "You are an expert in {{subject}}. Be friendly, helpful and concise.",
    template_variables: {
        customer_name: {},
        subject: {
            default_value: "Chess",
        },
    },
    timezone: "America/Los_Angeles",
    tools: ["keypad_input"],
    voice_id: "sarah",
    welcome_message: "Hi {{customer_name}}. How can I help you today?",
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

**request:** `SeedRequestParameters.AgentsCreateRequest`

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
