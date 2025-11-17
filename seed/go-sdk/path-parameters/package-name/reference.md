# Reference
## Organizations
<details><summary><code>client.Organizations.GetOrganization(TenantId, OrganizationId) -> *path.Organization</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```go
client.Organizations.GetOrganization(
        context.TODO(),
        "tenant_id",
        "organization_id",
    )
}
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

<details><summary><code>client.Organizations.GetOrganizationUser(TenantId, OrganizationId, UserId) -> *path.User</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```go
client.Organizations.GetOrganizationUser(
        context.TODO(),
        "tenant_id",
        "organization_id",
        "user_id",
    )
}
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
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.Organizations.SearchOrganizations(TenantId, OrganizationId) -> []*path.Organization</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```go
request := &path.SearchOrganizationsRequest{
        Limit: path.Int(
            1,
        ),
    }
client.Organizations.SearchOrganizations(
        context.TODO(),
        "tenant_id",
        "organization_id",
        request,
    )
}
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

**limit:** `*int` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## User
<details><summary><code>client.User.GetUser(TenantId, UserId) -> *path.User</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```go
client.User.GetUser(
        context.TODO(),
        "tenant_id",
        "user_id",
    )
}
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
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.User.CreateUser(TenantId, request) -> *path.User</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```go
request := &path.User{
        Name: "name",
        Tags: []string{
            "tags",
            "tags",
        },
    }
client.User.CreateUser(
        context.TODO(),
        "tenant_id",
        request,
    )
}
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

**request:** `*path.User` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.User.UpdateUser(TenantId, UserId, request) -> *path.User</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```go
request := &path.UpdateUserRequest{
        Body: &path.User{
            Name: "name",
            Tags: []string{
                "tags",
                "tags",
            },
        },
    }
client.User.UpdateUser(
        context.TODO(),
        "tenant_id",
        "user_id",
        request,
    )
}
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

**request:** `*path.User` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.User.SearchUsers(TenantId, UserId) -> []*path.User</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```go
request := &path.SearchUsersRequest{
        Limit: path.Int(
            1,
        ),
    }
client.User.SearchUsers(
        context.TODO(),
        "tenant_id",
        "user_id",
        request,
    )
}
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

**limit:** `*int` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.User.GetUserMetadata(TenantId, UserId, Version) -> *path.User</code></summary>
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

```go
client.User.GetUserMetadata(
        context.TODO(),
        "tenant_id",
        "user_id",
        1,
    )
}
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

**version:** `int` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.User.GetUserSpecifics(TenantId, UserId, Version, Thought) -> *path.User</code></summary>
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

```go
client.User.GetUserSpecifics(
        context.TODO(),
        "tenant_id",
        "user_id",
        1,
        "thought",
    )
}
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

**version:** `int` 
    
</dd>
</dl>

<dl>
<dd>

**thought:** `string` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>
