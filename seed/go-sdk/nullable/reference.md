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
