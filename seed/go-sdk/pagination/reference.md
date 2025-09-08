# Reference
## Conversations
<details><summary><code>client.Complex.Search(Index, request) -> *fern.PaginatedConversationResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```go
client.Complex.Search(
        context.TODO(),
        "index",
        &fern.SearchRequest{
            Pagination: &fern.StartingAfterPaging{
                PerPage: 1,
                StartingAfter: fern.String(
                    "starting_after",
                ),
            },
            Query: &fern.SearchRequestQuery{
                SingleFilterSearchRequest: &fern.SingleFilterSearchRequest{
                    Field: fern.String(
                        "field",
                    ),
                    Operator: fern.SingleFilterSearchRequestOperatorEquals.Ptr(),
                    Value: fern.String(
                        "value",
                    ),
                },
            },
        },
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

**index:** `string` 
    
</dd>
</dl>

<dl>
<dd>

**request:** `*fern.SearchRequest` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## Users
<details><summary><code>client.Users.ListWithCursorPagination() -> *fern.ListUsersPaginationResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```go
client.Users.ListWithCursorPagination(
        context.TODO(),
        &fern.ListUsersCursorPaginationRequest{
            Page: fern.Int(
                1,
            ),
            PerPage: fern.Int(
                1,
            ),
            Order: fern.OrderAsc.Ptr(),
            StartingAfter: fern.String(
                "starting_after",
            ),
        },
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

**page:** `*int` — Defaults to first page
    
</dd>
</dl>

<dl>
<dd>

**perPage:** `*int` — Defaults to per page
    
</dd>
</dl>

<dl>
<dd>

**order:** `*fern.Order` 
    
</dd>
</dl>

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

<details><summary><code>client.Users.ListWithMixedTypeCursorPagination() -> *fern.ListUsersMixedTypePaginationResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```go
client.Users.ListWithMixedTypeCursorPagination(
        context.TODO(),
        &fern.ListUsersMixedTypeCursorPaginationRequest{
            Cursor: fern.String(
                "cursor",
            ),
        },
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

**cursor:** `*string` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.Users.ListWithBodyCursorPagination(request) -> *fern.ListUsersPaginationResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```go
client.Users.ListWithMixedTypeCursorPagination(
        context.TODO(),
        &fern.ListUsersMixedTypeCursorPaginationRequest{},
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

**pagination:** `*fern.WithCursor` 

The object that contains the cursor used for pagination
in order to fetch the next page of results.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.Users.ListWithOffsetPagination() -> *fern.ListUsersPaginationResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```go
client.Users.ListWithCursorPagination(
        context.TODO(),
        &fern.ListUsersCursorPaginationRequest{
            Page: fern.Int(
                1,
            ),
            PerPage: fern.Int(
                1,
            ),
            Order: fern.OrderAsc.Ptr(),
            StartingAfter: fern.String(
                "starting_after",
            ),
        },
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

**page:** `*int` — Defaults to first page
    
</dd>
</dl>

<dl>
<dd>

**perPage:** `*int` — Defaults to per page
    
</dd>
</dl>

<dl>
<dd>

**order:** `*fern.Order` 
    
</dd>
</dl>

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

<details><summary><code>client.Users.ListWithDoubleOffsetPagination() -> *fern.ListUsersPaginationResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```go
client.Users.ListWithCursorPagination(
        context.TODO(),
        &fern.ListUsersCursorPaginationRequest{
            Page: fern.Int(
                1.1,
            ),
            PerPage: fern.Int(
                1.1,
            ),
            Order: fern.OrderAsc.Ptr(),
            StartingAfter: fern.String(
                "starting_after",
            ),
        },
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

**page:** `*float64` — Defaults to first page
    
</dd>
</dl>

<dl>
<dd>

**perPage:** `*float64` — Defaults to per page
    
</dd>
</dl>

<dl>
<dd>

**order:** `*fern.Order` 
    
</dd>
</dl>

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

<details><summary><code>client.Users.ListWithBodyOffsetPagination(request) -> *fern.ListUsersPaginationResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```go
client.Users.ListWithMixedTypeCursorPagination(
        context.TODO(),
        &fern.ListUsersMixedTypeCursorPaginationRequest{},
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

**pagination:** `*fern.WithPage` 

The object that contains the offset used for pagination
in order to fetch the next page of results.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.Users.ListWithOffsetStepPagination() -> *fern.ListUsersPaginationResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```go
client.Users.ListWithOffsetStepPagination(
        context.TODO(),
        &fern.ListUsersOffsetStepPaginationRequest{
            Page: fern.Int(
                1,
            ),
            Limit: fern.Int(
                1,
            ),
            Order: fern.OrderAsc.Ptr(),
        },
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

**page:** `*int` — Defaults to first page
    
</dd>
</dl>

<dl>
<dd>

**limit:** `*int` 

The maximum number of elements to return.
This is also used as the step size in this
paginated endpoint.
    
</dd>
</dl>

<dl>
<dd>

**order:** `*fern.Order` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.Users.ListWithOffsetPaginationHasNextPage() -> *fern.ListUsersPaginationResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```go
client.Users.ListWithOffsetStepPagination(
        context.TODO(),
        &fern.ListUsersOffsetStepPaginationRequest{
            Page: fern.Int(
                1,
            ),
            Limit: fern.Int(
                1,
            ),
            Order: fern.OrderAsc.Ptr(),
        },
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

**page:** `*int` — Defaults to first page
    
</dd>
</dl>

<dl>
<dd>

**limit:** `*int` 

The maximum number of elements to return.
This is also used as the step size in this
paginated endpoint.
    
</dd>
</dl>

<dl>
<dd>

**order:** `*fern.Order` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.Users.ListWithExtendedResults() -> *fern.ListUsersExtendedResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```go
client.Users.ListWithExtendedResults(
        context.TODO(),
        &fern.ListUsersExtendedRequest{
            Cursor: fern.UUID(
                uuid.MustParse(
                    "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32",
                ),
            ),
        },
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

**cursor:** `*uuid.UUID` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.Users.ListWithExtendedResultsAndOptionalData() -> *fern.ListUsersExtendedOptionalListResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```go
client.Users.ListWithExtendedResults(
        context.TODO(),
        &fern.ListUsersExtendedRequest{
            Cursor: fern.UUID(
                uuid.MustParse(
                    "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32",
                ),
            ),
        },
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

**cursor:** `*uuid.UUID` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.Users.ListUsernames() -> *fern.UsernameCursor</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```go
client.Users.ListWithCursorPagination(
        context.TODO(),
        &fern.ListUsersCursorPaginationRequest{
            StartingAfter: fern.String(
                "starting_after",
            ),
        },
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

<details><summary><code>client.Users.ListWithGlobalConfig() -> *fern.UsernameContainer</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```go
client.Users.ListWithGlobalConfig(
        context.TODO(),
        &fern.ListWithGlobalConfigRequest{
            Offset: fern.Int(
                1,
            ),
        },
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

**offset:** `*int` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>
