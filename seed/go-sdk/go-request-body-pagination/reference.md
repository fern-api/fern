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

Pagination endpoint with an optional top-level cursor field in the request body. An empty
string cursor terminates the pager, just like a null cursor does.
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

<details><summary><code>client.Users.ListWithUUIDBodyCursorPagination(request) -> *fern.ListUsersUUIDCursorResponse</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Pagination endpoint with an optional uuid cursor field in the request body. Only string cursors
treat an empty value as the last page, so this endpoint terminates on a null cursor alone.
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
request := &fern.ListUsersUUIDBodyCursorPaginationRequest{
    Cursor: fern.UUID(
        uuid.MustParse(
            "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32",
        ),
    ),
}
client.Users.ListWithUUIDBodyCursorPagination(
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

**cursor:** `*uuid.UUID` 
    
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

