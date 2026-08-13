# Reference
## Users
<details><summary><code>client.Users.ListWithBodyCursorPagination(request) -> *fern.ListUsersResponse</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Pagination endpoint with a top-level cursor field in the request body.
</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```go
request := &fern.ListUsersBodyCursorPaginationRequest{
    Cursor: fern.String(
        "cursor",
    ),
    Filter: fern.String(
        "filter",
    ),
}
client.Users.ListWithBodyCursorPagination(
    context.TODO(),
    request,
)
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

**cursor:** `*string` 
    
</dd>
</dl>

<dl>
<dd>

**filter:** `*string` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.Users.ListWithRequiredBodyCursorPagination(request) -> *fern.ListUsersRequiredCursorResponse</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Pagination endpoint with a required top-level cursor field in the request body.
</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```go
request := &fern.ListUsersRequiredBodyCursorPaginationRequest{
    Cursor: "cursor",
}
client.Users.ListWithRequiredBodyCursorPagination(
    context.TODO(),
    request,
)
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

**cursor:** `string` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.Users.ListWithBodyOffsetPagination(request) -> *fern.ListUsersResponse</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Pagination endpoint with a top-level page field in the request body.
</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```go
request := &fern.ListUsersBodyOffsetPaginationRequest{
    Page: fern.Int(
        1,
    ),
    Limit: fern.Int(
        1,
    ),
}
client.Users.ListWithBodyOffsetPagination(
    context.TODO(),
    request,
)
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

**page:** `*int` 
    
</dd>
</dl>

<dl>
<dd>

**limit:** `*int` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.Users.ListWithNestedBodyCursorPagination(request) -> *fern.ListUsersResponse</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Pagination endpoint with a nested cursor field in the request body. Nested page properties are
not supported, so this endpoint is generated without a pager.
</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```go
request := &fern.ListUsersNestedBodyCursorPaginationRequest{
    Pagination: &fern.WithCursor{
        Cursor: fern.String(
            "cursor",
        ),
    },
}
client.Users.ListWithNestedBodyCursorPagination(
    context.TODO(),
    request,
)
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

**pagination:** `*fern.WithCursor` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

