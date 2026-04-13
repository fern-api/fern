# Reference
## Nullable
<details><summary><code>client.Nullable.Getusers() -> []*fern.User</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```go
request := &fern.NullableGetUsersRequest{}
client.Nullable.Getusers(
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

<details><summary><code>client.Nullable.Createuser(request) -> *fern.User</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```go
request := &fern.NullableCreateUserRequest{
        Username: "username",
    }
client.Nullable.Createuser(
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

<details><summary><code>client.Nullable.Deleteuser(request) -> bool</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```go
request := &fern.NullableDeleteUserRequest{}
client.Nullable.Deleteuser(
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

**username:** `*string` — The user to delete.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

