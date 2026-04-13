# Reference
## User
<details><summary><code>client.User.Createuser(request) -> *fern.User</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```go
request := &fern.UserCreateUserRequest{
        Type: fern.UserCreateUserRequestTypeCreateUserRequest,
        Version: fern.UserCreateUserRequestVersionV1,
        Name: "name",
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

**type_:** `*fern.UserCreateUserRequestType` 
    
</dd>
</dl>

<dl>
<dd>

**version:** `*fern.UserCreateUserRequestVersion` 
    
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

