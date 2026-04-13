# Reference
## Users
<details><summary><code>client.Users.Listwithcustompager() -> *fern.UsersListResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```go
request := &fern.UsersListWithCustomPagerRequest{}
client.Users.Listwithcustompager(
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

**limit:** `*int` — The maximum number of results to return.
    
</dd>
</dl>

<dl>
<dd>

**startingAfter:** `*string` — The cursor used for pagination.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

