# Reference
## Users
<details><summary><code>client.Users.ListWithCustomPager() -> *core.PayrocPager[*fern.UsersListResponse, []string, *fern.Link]</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```go
request := &fern.ListWithCustomPagerRequest{
        Limit: fern.Int(
            1,
        ),
        StartingAfter: fern.String(
            "starting_after",
        ),
    }
client.Users.ListWithCustomPager(
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

