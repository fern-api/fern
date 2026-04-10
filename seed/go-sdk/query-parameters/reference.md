# Reference
## User
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
</dd>
</dl>


</dd>
</dl>
</details>

