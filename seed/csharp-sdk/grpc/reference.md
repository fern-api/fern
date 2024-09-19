# Reference
## User
<details><summary><code>client.User.<a href="/src/SeedApi/User/UserClient.cs">CreateUserAsync</a>(CreateUserRequest { ... }) -> CreateUserResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
await client.User.CreateUserAsync(
    new CreateUserRequest
    {
        Username = "string",
        Email = "string",
        Age = 1,
        Weight = 1.1f,
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

<details><summary><code>client.User.<a href="/src/SeedApi/User/UserClient.cs">GetUserAsync</a>(GetUserRequest { ... }) -> User</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
await client.User.GetUserAsync(
    new GetUserRequest
    {
        Username = "string",
        Age = 1,
        Weight = 1.1f,
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

**request:** `GetUserRequest` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>
