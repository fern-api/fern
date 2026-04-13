# Reference
## Organizations
<details><summary><code>client.Organizations.Getorganization(TenantID, OrganizationID) -> *fern.Organization</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```go
client.Organizations.Getorganization(
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

<details><summary><code>client.Organizations.Getorganizationuser(TenantID, OrganizationID, UserID) -> *fern.User</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```go
client.Organizations.Getorganizationuser(
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

<details><summary><code>client.Organizations.Searchorganizations(TenantID, OrganizationID) -> []*fern.Organization</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```go
request := &fern.OrganizationsSearchOrganizationsRequest{}
client.Organizations.Searchorganizations(
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
<details><summary><code>client.User.Getuser(TenantID, UserID) -> *fern.User</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```go
client.User.Getuser(
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

<details><summary><code>client.User.Updateuser(TenantID, UserID, request) -> *fern.User</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```go
request := &fern.UserUpdateUserRequest{
        Body: &fern.User{
            Name: "name",
            Tags: []string{
                "tags",
            },
        },
    }
client.User.Updateuser(
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

<details><summary><code>client.User.Createuser(TenantID, request) -> *fern.User</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```go
request := &fern.UserCreateUserRequest{
        Body: &fern.User{
            Name: "name",
            Tags: []string{
                "tags",
            },
        },
    }
client.User.Createuser(
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

<details><summary><code>client.User.Searchusers(TenantID, UserID) -> []*fern.User</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```go
request := &fern.UserSearchUsersRequest{}
client.User.Searchusers(
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

<details><summary><code>client.User.Getusermetadata(TenantID, UserID, Version) -> *fern.User</code></summary>
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
client.User.Getusermetadata(
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

<details><summary><code>client.User.Getuserspecifics(TenantID, UserID, Version, Thought) -> *fern.User</code></summary>
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
client.User.Getuserspecifics(
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

