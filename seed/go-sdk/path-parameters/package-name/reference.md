# Reference
## Organizations
<details><summary><code>client.Organizations.Getorganization(TenantID, OrganizationID) -> *path.Organization</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```go
request := &path.OrganizationsGetOrganizationRequest{
        TenantID: "tenant_id",
        OrganizationID: "organization_id",
    }
client.Organizations.Getorganization(
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
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.Organizations.Getorganizationuser(TenantID, OrganizationID, UserID) -> *path.User</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```go
request := &path.OrganizationsGetOrganizationUserRequest{
        TenantID: "tenant_id",
        OrganizationID: "organization_id",
        UserID: "user_id",
    }
client.Organizations.Getorganizationuser(
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

<details><summary><code>client.Organizations.Searchorganizations(TenantID, OrganizationID) -> []*path.Organization</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```go
request := &path.OrganizationsSearchOrganizationsRequest{
        TenantID: "tenant_id",
        OrganizationID: "organization_id",
    }
client.Organizations.Searchorganizations(
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

**limit:** `*int` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## User
<details><summary><code>client.User.Getuser(TenantID, UserID) -> *path.User</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```go
request := &path.UserGetUserRequest{
        TenantID: "tenant_id",
        UserID: "user_id",
    }
client.User.Getuser(
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

<details><summary><code>client.User.Updateuser(TenantID, UserID, request) -> *path.User</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```go
request := &path.UserUpdateUserRequest{
        TenantID: "tenant_id",
        UserID: "user_id",
        Body: &path.User{
            Name: "name",
            Tags: []string{
                "tags",
            },
        },
    }
client.User.Updateuser(
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

**request:** `*path.User` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.User.Createuser(TenantID, request) -> *path.User</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```go
request := &path.UserCreateUserRequest{
        TenantID: "tenant_id",
        Body: &path.User{
            Name: "name",
            Tags: []string{
                "tags",
            },
        },
    }
client.User.Createuser(
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

**request:** `*path.User` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.User.Searchusers(TenantID, UserID) -> []*path.User</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```go
request := &path.UserSearchUsersRequest{
        TenantID: "tenant_id",
        UserID: "user_id",
    }
client.User.Searchusers(
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

<details><summary><code>client.User.Getusermetadata(TenantID, UserID, Version) -> *path.User</code></summary>
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
request := &path.UserGetUserMetadataRequest{
        TenantID: "tenant_id",
        UserID: "user_id",
        Version: 1,
    }
client.User.Getusermetadata(
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

<details><summary><code>client.User.Getuserspecifics(TenantID, UserID, Version, Thought) -> *path.User</code></summary>
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
request := &path.UserGetUserSpecificsRequest{
        TenantID: "tenant_id",
        UserID: "user_id",
        Version: 1,
        Thought: "thought",
    }
client.User.Getuserspecifics(
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

