# Reference
## Organizations
<details><summary><code>client.Organizations.GetOrganization(TenantID, OrganizationID) -> *fern.Organization</code></summary>
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

**tenantID:** `string` 
    
</dd>
</dl>

<dl>
<dd>

**organizationID:** `string` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.Organizations.GetOrganizationUser(TenantID, OrganizationID, UserID) -> *fern.User</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```go
request := &fern.GetOrganizationUserRequest{
        TenantID: "tenant_id",
        OrganizationID: "organization_id",
        UserID: "user_id",
    }
client.Organizations.GetOrganizationUser(
        context.TODO(),
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

**tenantID:** `string` 
    
</dd>
</dl>

<dl>
<dd>

**organizationID:** `string` 
    
</dd>
</dl>

<dl>
<dd>

**userID:** `string` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.Organizations.SearchOrganizations(TenantID, OrganizationID) -> []*fern.Organization</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```go
request := &fern.SearchOrganizationsRequest{
        Limit: fern.Int(
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

**tenantID:** `string` 
    
</dd>
</dl>

<dl>
<dd>

**organizationID:** `string` 
    
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
<details><summary><code>client.User.GetUser(TenantID, UserID) -> *fern.User</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```go
request := &fern.GetUsersRequest{
        TenantID: "tenant_id",
        UserID: "user_id",
    }
client.User.GetUser(
        context.TODO(),
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

**tenantID:** `string` 
    
</dd>
</dl>

<dl>
<dd>

**userID:** `string` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.User.CreateUser(TenantID, request) -> *fern.User</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```go
request := &fern.User{
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

**tenantID:** `string` 
    
</dd>
</dl>

<dl>
<dd>

**request:** `*fern.User` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.User.UpdateUser(TenantID, UserID, request) -> *fern.User</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```go
request := &fern.UpdateUserRequest{
        TenantID: "tenant_id",
        UserID: "user_id",
        Body: &fern.User{
            Name: "name",
            Tags: []string{
                "tags",
                "tags",
            },
        },
    }
client.User.UpdateUser(
        context.TODO(),
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

**tenantID:** `string` 
    
</dd>
</dl>

<dl>
<dd>

**userID:** `string` 
    
</dd>
</dl>

<dl>
<dd>

**request:** `*fern.User` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.User.SearchUsers(TenantID, UserID) -> []*fern.User</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```go
request := &fern.SearchUsersRequest{
        TenantID: "tenant_id",
        UserID: "user_id",
        Limit: fern.Int(
            1,
        ),
    }
client.User.SearchUsers(
        context.TODO(),
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

**tenantID:** `string` 
    
</dd>
</dl>

<dl>
<dd>

**userID:** `string` 
    
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

<details><summary><code>client.User.GetUserMetadata(TenantID, UserID, Version) -> *fern.User</code></summary>
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
request := &fern.GetUserMetadataRequest{
        TenantID: "tenant_id",
        UserID: "user_id",
        Version: 1,
    }
client.User.GetUserMetadata(
        context.TODO(),
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

**tenantID:** `string` 
    
</dd>
</dl>

<dl>
<dd>

**userID:** `string` 
    
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

<details><summary><code>client.User.GetUserSpecifics(TenantID, UserID, Version, Thought) -> *fern.User</code></summary>
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
request := &fern.GetUserSpecificsRequest{
        TenantID: "tenant_id",
        UserID: "user_id",
        Version: 1,
        Thought: "thought",
    }
client.User.GetUserSpecifics(
        context.TODO(),
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

**tenantID:** `string` 
    
</dd>
</dl>

<dl>
<dd>

**userID:** `string` 
    
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

