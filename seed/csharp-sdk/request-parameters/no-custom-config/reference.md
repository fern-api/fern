# Reference
## User
<details><summary><code>client.User.<a href="/src/SeedApi/User/UserClient.cs">CreateusernameAsync</a>(UserCreateUsernameRequest { ... })</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
await client.User.CreateusernameAsync(
    new UserCreateUsernameRequest
    {
        Tags = ["tags"],
        Username = "username",
        Password = "password",
        Name = "name",
    }
);
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

**request:** `UserCreateUsernameRequest` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.User.<a href="/src/SeedApi/User/UserClient.cs">CreateusernamewithreferencedtypeAsync</a>(CreateUsernameBody { ... })</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
await client.User.CreateusernamewithreferencedtypeAsync(
    new CreateUsernameBody
    {
        Tags = ["tags"],
        Username = "username",
        Password = "password",
        Name = "name",
    }
);
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

**request:** `CreateUsernameBody` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.User.<a href="/src/SeedApi/User/UserClient.cs">CreateusernameoptionalAsync</a>(CreateUsernameBodyOptionalProperties { ... })</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
await client.User.CreateusernameoptionalAsync(new CreateUsernameBodyOptionalProperties());
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

**request:** `CreateUsernameBodyOptionalProperties` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.User.<a href="/src/SeedApi/User/UserClient.cs">GetusernameAsync</a>(UserGetUsernameRequest { ... }) -> WithRawResponseTask&lt;User&gt;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
await client.User.GetusernameAsync(
    new UserGetUsernameRequest
    {
        Limit = 1,
        Id = "id",
        Date = new DateOnly(2023, 1, 15),
        Deadline = new DateTime(2024, 01, 15, 09, 30, 00, 000),
        Bytes = "bytes",
        User = new User
        {
            Name = "name",
            Tags = new List<string>() { "tags", "tags" },
        },
        UserList =
        [
            new User
            {
                Name = "name",
                Tags = new List<string>() { "tags", "tags" },
            },
        ],
        OptionalDeadline = new DateTime(2024, 01, 15, 09, 30, 00, 000),
        KeyValue = new Dictionary<string, string>() { { "keyValue", "keyValue" } },
        OptionalString = "optionalString",
        NestedUser = new NestedUser
        {
            Name = "name",
            User = new User
            {
                Name = "name",
                Tags = new List<string>() { "tags", "tags" },
            },
        },
        OptionalUser = new User
        {
            Name = "name",
            Tags = new List<string>() { "tags", "tags" },
        },
        ExcludeUser =
        [
            new User
            {
                Name = "name",
                Tags = new List<string>() { "tags", "tags" },
            },
        ],
        Filter = ["filter"],
        LongParam = 1000000,
        BigIntParam = 1,
    }
);
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

**request:** `UserGetUsernameRequest` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

