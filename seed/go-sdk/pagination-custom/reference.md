# Reference
## Users
<details><summary><code>client.Users.ListUsernamesCustom() -> *core.PayrocPager[fern.UsernameCursor]</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```go
request := &fern.ListUsernamesRequestCustom{
        StartingAfter: fern.String(
            "starting_after",
        ),
    }
client.Users.ListUsernamesCustom(
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

**startingAfter:** `*string` 

The cursor used for pagination in order to fetch
the next page of results.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>
