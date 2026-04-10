# Reference
## User
<details><summary><code>client.User.<a href="/src/SeedApi/User/UserClient.cs">GetuserAsync</a>(UserGetUserRequest { ... })</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Retrieve a user.
This endpoint is used to retrieve a user.
</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
await client.User.GetuserAsync(new UserGetUserRequest { UserId = "userId" });
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

**request:** `UserGetUserRequest` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.User.<a href="/src/SeedApi/User/UserClient.cs">CreateuserAsync</a>(UserCreateUserRequest { ... }) -> WithRawResponseTask&lt;User&gt;</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Create a new user.
This endpoint is used to create a new user.
</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
await client.User.CreateuserAsync(new UserCreateUserRequest { Name = "name" });
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

**request:** `UserCreateUserRequest` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

