# Reference
## User
<details><summary><code>client.User.GetUsername() -> *fern.User</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```go
request := &fern.GetUsersRequest{
        Limit: 1,
        Id: uuid.MustParse(
            "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32",
        ),
        Date: fern.MustParseDate(
            "2023-01-15",
        ),
        Deadline: fern.MustParseDateTime(
            "2024-01-15T09:30:00Z",
        ),
        Bytes: []byte("SGVsbG8gd29ybGQh"),
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
        Filter: []string{
            "filter",
        },
    }
client.User.GetUsername(
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

**id:** `uuid.UUID` 
    
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

**bytes:** `[]byte` 
    
</dd>
</dl>

<dl>
<dd>

**user:** `*fern.User` 
    
</dd>
</dl>

<dl>
<dd>

**userList:** `[]*fern.User` 
    
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

**filter:** `string` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>
