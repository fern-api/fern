# Reference
## Users
<details><summary><code>$client-&gt;users-&gt;listWithCustomPager($request) -> ?UsersListResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```php
$client->users->listWithCustomPager(
    new ListWithCustomPagerRequest([
        'limit' => 1,
        'startingAfter' => 'starting_after',
    ]),
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

**$limit:** `?int` — The maximum number of results to return.
    
</dd>
</dl>

<dl>
<dd>

**$startingAfter:** `?string` — The cursor used for pagination.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

