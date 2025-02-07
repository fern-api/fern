# Reference
## Nullable
<details><summary><code>client.Nullable.<a href="/src/SeedNullable/Nullable/NullableClient.cs">GetUsersAsync</a>(GetUsersRequest { ... }) -> IEnumerable<User></code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
await client.Nullable.GetUsersAsync(
    new GetUsersRequest
    {
        Usernames = ["usernames"],
        Avatar = "avatar",
        Activated = [true],
        Tags = ["tags"],
        Extra = true,
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

**request:** `GetUsersRequest` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.Nullable.<a href="/src/SeedNullable/Nullable/NullableClient.cs">CreateUserAsync</a>(CreateUserRequest { ... }) -> User</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
await client.Nullable.CreateUserAsync(
    new CreateUserRequest
    {
        Username = "username",
        Tags = new List<string>() { "tags", "tags" },
        Metadata = new Metadata
        {
            CreatedAt = new DateTime(2024, 01, 15, 09, 30, 00, 000),
            UpdatedAt = new DateTime(2024, 01, 15, 09, 30, 00, 000),
            Avatar = "avatar",
            Activated = true,
        },
        Avatar = "avatar",
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

**request:** `CreateUserRequest` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.Nullable.<a href="/src/SeedNullable/Nullable/NullableClient.cs">DeleteUserAsync</a>(DeleteUserRequest { ... }) -> bool</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
await client.Nullable.DeleteUserAsync(new DeleteUserRequest { Username = "xy" });
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
</dd>
</dl>


</dd>
</dl>
</details>
