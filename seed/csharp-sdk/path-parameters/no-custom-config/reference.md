# Reference
## Bytes
## EndpointHeaders
<details><summary><code>client.EndpointHeaders.<a href="/src/SeedPathParameters/EndpointHeaders/EndpointHeadersClient.cs">GetEndpointHeadersPathParamAsync</a>(GetEndpointHeadersPathParamRequest { ... }) -> WithRawResponseTask&lt;User&gt;</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Endpoint with only path parameters and endpoint-level headers but NO service-level headers. The wrapper should NOT be elided because it holds the endpoint header field.
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
await client.EndpointHeaders.GetEndpointHeadersPathParamAsync(
    new GetEndpointHeadersPathParamRequest
    {
        TenantId = "tenant_id",
        HeaderId = "header_id",
        XApiVersion = "X-API-Version",
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

**request:** `GetEndpointHeadersPathParamRequest` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## Headers
<details><summary><code>client.Headers.<a href="/src/SeedPathParameters/Headers/HeadersClient.cs">GetHeadersPathParamAsync</a>(GetHeadersPathParamRequest { ... }) -> WithRawResponseTask&lt;User&gt;</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Endpoint with only path parameters but service-level headers. The wrapper should NOT be elided because it holds the service header field.
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
await client.Headers.GetHeadersPathParamAsync(
    new GetHeadersPathParamRequest
    {
        TenantId = "tenant_id",
        HeaderId = "header_id",
        XTenantId = "X-Tenant-Id",
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

**request:** `GetHeadersPathParamRequest` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.Headers.<a href="/src/SeedPathParameters/Headers/HeadersClient.cs">GetHeadersPathParamBodyAsync</a>(GetHeadersPathParamBodyRequest { ... }) -> WithRawResponseTask&lt;User&gt;</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Endpoint with path parameter + body + service-level headers. The wrapper should NOT be unwrapped because of service headers.
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
await client.Headers.GetHeadersPathParamBodyAsync(
    new GetHeadersPathParamBodyRequest
    {
        TenantId = "tenant_id",
        HeaderId = "header_id",
        XTenantId = "X-Tenant-Id",
        Body = new User
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

**request:** `GetHeadersPathParamBodyRequest` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## Organizations
<details><summary><code>client.Organizations.<a href="/src/SeedPathParameters/Organizations/OrganizationsClient.cs">GetOrganizationAsync</a>(tenantId, organizationId) -> WithRawResponseTask&lt;Organization&gt;</code></summary>
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

<details><summary><code>client.Organizations.<a href="/src/SeedPathParameters/Organizations/OrganizationsClient.cs">GetOrganizationUserAsync</a>(GetOrganizationUserRequest { ... }) -> WithRawResponseTask&lt;User&gt;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
await client.Organizations.GetOrganizationUserAsync(
    new GetOrganizationUserRequest
    {
        TenantId = "tenant_id",
        OrganizationId = "organization_id",
        UserId = "user_id",
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

**request:** `GetOrganizationUserRequest` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.Organizations.<a href="/src/SeedPathParameters/Organizations/OrganizationsClient.cs">SearchOrganizationsAsync</a>(tenantId, organizationId, SearchOrganizationsRequest { ... }) -> WithRawResponseTask&lt;IEnumerable&lt;Organization&gt;&gt;</code></summary>
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

**request:** `SearchOrganizationsRequest` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## User
<details><summary><code>client.User.<a href="/src/SeedPathParameters/User/UserClient.cs">GetUserAsync</a>(GetUsersRequest { ... }) -> WithRawResponseTask&lt;User&gt;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
await client.User.GetUserAsync(new GetUsersRequest { TenantId = "tenant_id", UserId = "user_id" });
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

<details><summary><code>client.User.<a href="/src/SeedPathParameters/User/UserClient.cs">CreateUserAsync</a>(tenantId, User { ... }) -> WithRawResponseTask&lt;User&gt;</code></summary>
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
    new User
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

**request:** `User` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.User.<a href="/src/SeedPathParameters/User/UserClient.cs">UpdateUserAsync</a>(UpdateUserRequest { ... }) -> WithRawResponseTask&lt;User&gt;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
await client.User.UpdateUserAsync(
    new UpdateUserRequest
    {
        TenantId = "tenant_id",
        UserId = "user_id",
        Body = new User
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

**request:** `UpdateUserRequest` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.User.<a href="/src/SeedPathParameters/User/UserClient.cs">SearchUsersAsync</a>(SearchUsersRequest { ... }) -> WithRawResponseTask&lt;IEnumerable&lt;User&gt;&gt;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
await client.User.SearchUsersAsync(
    new SearchUsersRequest
    {
        TenantId = "tenant_id",
        UserId = "user_id",
        Limit = 1,
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

**request:** `SearchUsersRequest` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.User.<a href="/src/SeedPathParameters/User/UserClient.cs">GetUserMetadataAsync</a>(GetUserMetadataRequest { ... }) -> WithRawResponseTask&lt;User&gt;</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Test endpoint with path parameter that has a text prefix (v{version})
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
await client.User.GetUserMetadataAsync(
    new GetUserMetadataRequest
    {
        TenantId = "tenant_id",
        UserId = "user_id",
        Version = 1,
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

**request:** `GetUserMetadataRequest` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.User.<a href="/src/SeedPathParameters/User/UserClient.cs">GetUserSpecificsAsync</a>(GetUserSpecificsRequest { ... }) -> WithRawResponseTask&lt;User&gt;</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Test endpoint with path parameters listed in different order than found in path
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
await client.User.GetUserSpecificsAsync(
    new GetUserSpecificsRequest
    {
        TenantId = "tenant_id",
        UserId = "user_id",
        Version = 1,
        Thought = "thought",
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

**request:** `GetUserSpecificsRequest` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

