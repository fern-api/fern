# Reference
## User
<details><summary><code>client.User.Createusername(request) -> error</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```go
request := &fern.UserCreateUsernameRequest{
        Tags: []*string{
            fern.String(
                "tags",
            ),
        },
        Username: "username",
        Password: "password",
        Name: "name",
    }
client.User.Createusername(
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

**tags:** `*string` 
    
</dd>
</dl>

<dl>
<dd>

**username:** `string` 
    
</dd>
</dl>

<dl>
<dd>

**password:** `string` 
    
</dd>
</dl>

<dl>
<dd>

**name:** `string` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.User.Createusernamewithreferencedtype(request) -> error</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```go
request := &fern.CreateUsernameBody{
        Tags: []*string{
            fern.String(
                "tags",
            ),
        },
        Username: "username",
        Password: "password",
        Name: "name",
    }
client.User.Createusernamewithreferencedtype(
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

**tags:** `*string` 
    
</dd>
</dl>

<dl>
<dd>

**username:** `string` 
    
</dd>
</dl>

<dl>
<dd>

**password:** `string` 
    
</dd>
</dl>

<dl>
<dd>

**name:** `string` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.User.Createusernameoptional(request) -> error</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```go
request := &fern.CreateUsernameBodyOptionalProperties{}
client.User.Createusernameoptional(
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

**username:** `*string` 
    
</dd>
</dl>

<dl>
<dd>

**password:** `*string` 
    
</dd>
</dl>

<dl>
<dd>

**name:** `*string` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.User.Getusername() -> *fern.User</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```go
request := &fern.UserGetUsernameRequest{
        Limit: 1,
        ID: "id",
        Date: fern.MustParseDate(
            "2023-01-15",
        ),
        Deadline: fern.MustParseDateTime(
            "2024-01-15T09:30:00Z",
        ),
        Bytes: "bytes",
        User: &fern.User{
            Name: "name",
            Tags: []string{
                "tags",
                "tags",
            },
        },
        UserList: []*fern.User{
            &fern.User{
                Name: "name",
                Tags: []string{
                    "tags",
                    "tags",
                },
            },
        },
        OptionalDeadline: fern.Time(
            fern.MustParseDateTime(
                "2024-01-15T09:30:00Z",
            ),
        ),
        KeyValue: map[string]string{
            "keyValue": "keyValue",
        },
        OptionalString: fern.String(
            "optionalString",
        ),
        NestedUser: &fern.NestedUser{
            Name: "name",
            User: &fern.User{
                Name: "name",
                Tags: []string{
                    "tags",
                    "tags",
                },
            },
        },
        OptionalUser: &fern.User{
            Name: "name",
            Tags: []string{
                "tags",
                "tags",
            },
        },
        ExcludeUser: []*fern.User{
            &fern.User{
                Name: "name",
                Tags: []string{
                    "tags",
                    "tags",
                },
            },
        },
        Filter: []*string{
            fern.String(
                "filter",
            ),
        },
        LongParam: int64(1000000),
        BigIntParam: 1,
    }
client.User.Getusername(
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

**limit:** `int` 
    
</dd>
</dl>

<dl>
<dd>

**id:** `string` 
    
</dd>
</dl>

<dl>
<dd>

**date:** `time.Time` 
    
</dd>
</dl>

<dl>
<dd>

**deadline:** `time.Time` 
    
</dd>
</dl>

<dl>
<dd>

**bytes:** `string` 
    
</dd>
</dl>

<dl>
<dd>

**user:** `*fern.User` 
    
</dd>
</dl>

<dl>
<dd>

**userList:** `*fern.User` 
    
</dd>
</dl>

<dl>
<dd>

**optionalDeadline:** `*time.Time` 
    
</dd>
</dl>

<dl>
<dd>

**keyValue:** `map[string]string` 
    
</dd>
</dl>

<dl>
<dd>

**optionalString:** `*string` 
    
</dd>
</dl>

<dl>
<dd>

**nestedUser:** `*fern.NestedUser` 
    
</dd>
</dl>

<dl>
<dd>

**optionalUser:** `*fern.User` 
    
</dd>
</dl>

<dl>
<dd>

**excludeUser:** `*fern.User` 
    
</dd>
</dl>

<dl>
<dd>

**filter:** `*string` 
    
</dd>
</dl>

<dl>
<dd>

**longParam:** `int64` 
    
</dd>
</dl>

<dl>
<dd>

**bigIntParam:** `int` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

