# Reference
## Organizations
<details><summary><code>client.Organizations.<a href="/src/SeedPathParameters/Organizations/OrganizationsClient.cs">GetOrganizationAsync</a>(tenantId, organizationId) -> SeedPathParameters.Organization</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
await client.Organizations.GetOrganizationAsync("tenant_id", "organization_id");
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

**tenantId:** `string` 
    
</dd>
</dl>

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

<details><summary><code>client.Organizations.<a href="/src/SeedPathParameters/Organizations/OrganizationsClient.cs">GetOrganizationUserAsync</a>(tenantId, organizationId, userId, SeedPathParameters.GetOrganizationUserRequest { ... }) -> SeedPathParameters.User</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
await client.Organizations.GetOrganizationUserAsync(
    "tenant_id",
    "organization_id",
    "user_id",
    new SeedPathParameters.GetOrganizationUserRequest()
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

**tenantId:** `string` 
    
</dd>
</dl>

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

**request:** `SeedPathParameters.GetOrganizationUserRequest` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.Organizations.<a href="/src/SeedPathParameters/Organizations/OrganizationsClient.cs">SearchOrganizationsAsync</a>(tenantId, organizationId, SeedPathParameters.SearchOrganizationsRequest { ... }) -> IEnumerable<SeedPathParameters.Organization></code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
await client.Organizations.SearchOrganizationsAsync(
    "tenant_id",
    "organization_id",
    new SeedPathParameters.SearchOrganizationsRequest { Limit = 1 }
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

**tenantId:** `string` 
    
</dd>
</dl>

<dl>
<dd>

**organizationId:** `string` 
    
</dd>
</dl>

<dl>
<dd>

**request:** `SeedPathParameters.SearchOrganizationsRequest` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## User
<details><summary><code>client.User.<a href="/src/SeedPathParameters/User/UserClient.cs">GetUserAsync</a>(tenantId, userId, SeedPathParameters.GetUsersRequest { ... }) -> SeedPathParameters.User</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
await client.User.GetUserAsync("tenant_id", "user_id", new SeedPathParameters.GetUsersRequest());
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

**tenantId:** `string` 
    
</dd>
</dl>

<dl>
<dd>

**userId:** `string` 
    
</dd>
</dl>

<dl>
<dd>

**request:** `SeedPathParameters.GetUsersRequest` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.User.<a href="/src/SeedPathParameters/User/UserClient.cs">CreateUserAsync</a>(tenantId, SeedPathParameters.User { ... }) -> SeedPathParameters.User</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
await client.User.CreateUserAsync(
    "tenant_id",
    new SeedPathParameters.User
    {
        Name = "name",
        Tags = new List<string>() { "tags", "tags" },
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

**tenantId:** `string` 
    
</dd>
</dl>

<dl>
<dd>

**request:** `SeedPathParameters.User` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.User.<a href="/src/SeedPathParameters/User/UserClient.cs">UpdateUserAsync</a>(tenantId, userId, SeedPathParameters.UpdateUserRequest { ... }) -> SeedPathParameters.User</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
await client.User.UpdateUserAsync(
    "tenant_id",
    "user_id",
    new SeedPathParameters.UpdateUserRequest
    {
        Body = new SeedPathParameters.User
        {
            Name = "name",
            Tags = new List<string>() { "tags", "tags" },
        },
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

**tenantId:** `string` 
    
</dd>
</dl>

<dl>
<dd>

**userId:** `string` 
    
</dd>
</dl>

<dl>
<dd>

**request:** `SeedPathParameters.UpdateUserRequest` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.User.<a href="/src/SeedPathParameters/User/UserClient.cs">SearchUsersAsync</a>(tenantId, userId, SeedPathParameters.SearchUsersRequest { ... }) -> IEnumerable<SeedPathParameters.User></code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
await client.User.SearchUsersAsync(
    "tenant_id",
    "user_id",
    new SeedPathParameters.SearchUsersRequest { Limit = 1 }
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

**tenantId:** `string` 
    
</dd>
</dl>

<dl>
<dd>

**userId:** `string` 
    
</dd>
</dl>

<dl>
<dd>

**request:** `SeedPathParameters.SearchUsersRequest` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>
