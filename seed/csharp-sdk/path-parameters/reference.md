# Reference
## User
<details><summary><code>client.User.<a href="/src/SeedPathParameters/User/UserClient.cs">GetOrganizationAsync</a>(organizationId) -> Organization</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
await client.User.GetOrganizationAsync("organizationId");
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

**organizationId:** `string` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.User.<a href="/src/SeedPathParameters/User/UserClient.cs">GetUserAsync</a>(userId, GetUsersRequest { ... }) -> User</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
await client.User.GetUserAsync("userId", new GetUsersRequest());
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

**request:** `GetUsersRequest` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.User.<a href="/src/SeedPathParameters/User/UserClient.cs">GetOrganizationUserAsync</a>(organizationId, userId, GetOrganizationUserRequest { ... }) -> User</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
await client.User.GetOrganizationUserAsync(
    "organizationId",
    "userId",
    new GetOrganizationUserRequest()
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

**organizationId:** `string` 
    
</dd>
</dl>

<dl>
<dd>

**userId:** `string` 
    
</dd>
</dl>

<dl>
<dd>

**request:** `GetOrganizationUserRequest` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.User.<a href="/src/SeedPathParameters/User/UserClient.cs">SearchUsersAsync</a>(userId, SearchUsersRequest { ... }) -> IEnumerable<User></code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
await client.User.SearchUsersAsync("userId", new SearchUsersRequest { Limit = 1 });
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

**request:** `SearchUsersRequest` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.User.<a href="/src/SeedPathParameters/User/UserClient.cs">SearchOrganizationsAsync</a>(organizationId, SearchOrganizationsRequest { ... }) -> IEnumerable<Organization></code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
await client.User.SearchOrganizationsAsync(
    "organizationId",
    new SearchOrganizationsRequest { Limit = 1 }
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

**organizationId:** `string` 
    
</dd>
</dl>

<dl>
<dd>

**request:** `SearchOrganizationsRequest` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>
