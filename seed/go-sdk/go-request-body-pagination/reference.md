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

<details><summary><code>client.Users.ListWithAliasBodyCursorPagination(request) -> *fern.ListUsersAliasCursorResponse</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Pagination endpoint whose cursor is a named alias resolving to an optional string. The alias
generates as a pointer in Go, so an empty string cursor terminates the pager here too.
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
request := &fern.ListUsersAliasBodyCursorPaginationRequest{
    Cursor: fern.String(
        "cursor",
    ),
}
client.Users.ListWithAliasBodyCursorPagination(
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

**cursor:** `fern.Cursor` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.Users.ListWithRequiredAliasBodyCursorPagination(request) -> *fern.ListUsersRequiredAliasCursorResponse</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Pagination endpoint whose cursor is a named alias resolving to a required string. The alias
generates as a value in Go, where the zero value is already the empty string.
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
request := &fern.ListUsersRequiredAliasBodyCursorPaginationRequest{
    Cursor: "cursor",
}
client.Users.ListWithRequiredAliasBodyCursorPagination(
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

**cursor:** `fern.RequiredCursor` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.Users.ListWithNullableAliasBodyCursorPagination(request) -> *fern.ListUsersNullableAliasCursorResponse</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Pagination endpoint whose cursor is a named alias resolving to a nullable string. Nullable
generates as a pointer in Go, so an empty string cursor terminates the pager here too.
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
request := &fern.ListUsersNullableAliasBodyCursorPaginationRequest{
    Cursor: fern.String(
        "cursor",
    ),
}
client.Users.ListWithNullableAliasBodyCursorPagination(
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

**cursor:** `fern.NullableCursor` 
    
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

Pagination endpoint with a cursor field nested in an optional object in the request body. The
pager allocates the object when the caller left it unset.
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

<details><summary><code>client.Users.ListWithNestedRequiredBodyCursorPagination(request) -> *fern.ListUsersRequiredCursorResponse</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Pagination endpoint with a required cursor field nested in a required object in the request
body. Objects are always pointers in Go, so the pager still allocates the object when nil.
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
request := &fern.ListUsersNestedRequiredBodyCursorPaginationRequest{
    Pagination: &fern.WithRequiredCursor{
        Cursor: "cursor",
    },
}
client.Users.ListWithNestedRequiredBodyCursorPagination(
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

**pagination:** `*fern.WithRequiredCursor` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.Users.ListWithDeeplyNestedBodyCursorPagination(request) -> *fern.ListUsersResponse</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Pagination endpoint with a cursor field nested two levels deep in optional objects in the
request body. The pager allocates every intermediate object that the caller left unset.
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
request := &fern.ListUsersDeeplyNestedBodyCursorPaginationRequest{
    Options: &fern.WithPagination{
        Pagination: &fern.WithCursor{
            Cursor: fern.String(
                "cursor",
            ),
        },
    },
}
client.Users.ListWithDeeplyNestedBodyCursorPagination(
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

**options:** `*fern.WithPagination` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.Users.ListWithNestedBodyOffsetPagination(request) -> *fern.ListUsersResponse</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Pagination endpoint with an offset field nested in an optional object in the request body,
alongside the page size. The pager allocates the object when the caller left it unset.
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
request := &fern.ListUsersNestedBodyOffsetPaginationRequest{
    Options: &fern.WithOffset{
        Offset: fern.Int(
            1,
        ),
        Count: fern.Int(
            1,
        ),
    },
}
client.Users.ListWithNestedBodyOffsetPagination(
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

**options:** `*fern.WithOffset` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.Users.ListWithAliasedNestedBodyOffsetPagination(request) -> *fern.ListUsersResponse</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Pagination endpoint with an offset field nested in a required alias to an object. Go
generates the alias as a pointer, so the pager must still nil-check and copy it.
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
request := &fern.ListUsersAliasedNestedBodyOffsetPaginationRequest{
    Options: &fern.WithOffset{
        Offset: fern.Int(
            1,
        ),
        Count: fern.Int(
            1,
        ),
    },
}
client.Users.ListWithAliasedNestedBodyOffsetPagination(
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

**options:** `fern.WithOffsetAlias` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

