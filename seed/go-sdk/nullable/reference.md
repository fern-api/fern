# Reference
## Nullable
<details><summary><code>client.Nullable.GetUsers() -> []*fern.User</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```go
client.Nullable.GetUsers(
        context.TODO(),
        &fern.GetUsersRequest{
            Usernames: []*string{
                fern.String(
                    "usernames",
                ),
            },
            Avatar: fern.String(
                "avatar",
            ),
            Activated: []*bool{
                fern.Bool(
                    true,
                ),
            },
            Tags: []*string{
                fern.String(
                    "tags",
                ),
            },
            Extra: fern.Bool(
                true,
            ),
        },
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

**usernames:** `*string` 
    
</dd>
</dl>

<dl>
<dd>

**avatar:** `*string` 
    
</dd>
</dl>

<dl>
<dd>

**activated:** `*bool` 
    
</dd>
</dl>

<dl>
<dd>

**tags:** `*string` 
    
</dd>
</dl>

<dl>
<dd>

**extra:** `*bool` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.Nullable.CreateUser(request) -> *fern.User</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```go
client.Nullable.CreateUser(
        context.TODO(),
        &fern.CreateUserRequest{
            Username: "username",
            Tags: []string{
                "tags",
                "tags",
            },
            Metadata: &fern.Metadata{
                CreatedAt: fern.MustParseDateTime(
                    "2024-01-15T09:30:00Z",
                ),
                UpdatedAt: fern.MustParseDateTime(
                    "2024-01-15T09:30:00Z",
                ),
                Avatar: fern.String(
                    "avatar",
                ),
                Activated: fern.Bool(
                    true,
                ),
                Status: &fern.Status{
                    Active: "active",
                },
                Values: map[string]*string{
                    "values": fern.String(
                        "values",
                    ),
                },
            },
            Avatar: fern.String(
                "avatar",
            ),
        },
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

**username:** `string` 
    
</dd>
</dl>

<dl>
<dd>

**tags:** `[]string` 
    
</dd>
</dl>

<dl>
<dd>

**metadata:** `*fern.Metadata` 
    
</dd>
</dl>

<dl>
<dd>

**avatar:** `*string` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.Nullable.DeleteUser(request) -> bool</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```go
client.Nullable.DeleteUser(
        context.TODO(),
        &fern.DeleteUserRequest{
            Username: fern.String(
                "xy",
            ),
        },
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

**username:** `*string` — The user to delete.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>
