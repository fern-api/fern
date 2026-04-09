# Reference
## Users
<details><summary><code>client.users.listWithCustomPager() -> FernCustomPaginator&amp;lt;UsersListResponse&amp;gt;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```java
client.users().listWithCustomPager(
    ListWithCustomPagerRequest
        .builder()
        .limit(1)
        .startingAfter("starting_after")
        .build()
);
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

**limit:** `Optional<Integer>` — The maximum number of results to return.
    
</dd>
</dl>

<dl>
<dd>

**startingAfter:** `Optional<String>` — The cursor used for pagination.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

