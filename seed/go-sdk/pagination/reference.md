# Reference
## Complex
<details><summary><code>client.Complex.Search(Index, request) -> *fern.PaginatedConversationResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```go
request := &fern.SearchRequest{
        Index: "index",
        Query: &fern.SearchRequestQuery{
            SingleFilterSearchRequest: &fern.SingleFilterSearchRequest{},
        },
    }
client.Complex.Search(
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

**index:** `string` 
    
</dd>
</dl>

<dl>
<dd>

**pagination:** `*fern.StartingAfterPaging` 
    
</dd>
</dl>

<dl>
<dd>

**query:** `*fern.SearchRequestQuery` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## InlineUsersInlineUsers
<details><summary><code>client.InlineUsersInlineUsers.InlineUsersInlineUsersListWithCursorPagination() -> *fern.InlineUsersListUsersPaginationResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```go
request := &fern.InlineUsersInlineUsersListWithCursorPaginationRequest{}
client.InlineUsersInlineUsers.InlineUsersInlineUsersListWithCursorPagination(
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

**order:** `*fern.InlineUsersOrder` 
    
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

<details><summary><code>client.InlineUsersInlineUsers.InlineUsersInlineUsersListWithMixedTypeCursorPagination() -> *fern.InlineUsersListUsersMixedTypePaginationResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```go
request := &fern.InlineUsersInlineUsersListWithMixedTypeCursorPaginationRequest{}
client.InlineUsersInlineUsers.InlineUsersInlineUsersListWithMixedTypeCursorPagination(
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

**cursor:** `*string` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.InlineUsersInlineUsers.InlineUsersInlineUsersListWithBodyCursorPagination(request) -> *fern.InlineUsersListUsersPaginationResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```go
request := &fern.InlineUsersInlineUsersListWithBodyCursorPaginationRequest{}
client.InlineUsersInlineUsers.InlineUsersInlineUsersListWithBodyCursorPagination(
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

**pagination:** `*fern.InlineUsersWithCursor` 

The object that contains the cursor used for pagination
in order to fetch the next page of results.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.InlineUsersInlineUsers.InlineUsersInlineUsersListWithOffsetPagination() -> *fern.InlineUsersListUsersPaginationResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```go
request := &fern.InlineUsersInlineUsersListWithOffsetPaginationRequest{}
client.InlineUsersInlineUsers.InlineUsersInlineUsersListWithOffsetPagination(
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

**order:** `*fern.InlineUsersOrder` 
    
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

<details><summary><code>client.InlineUsersInlineUsers.InlineUsersInlineUsersListWithDoubleOffsetPagination() -> *fern.InlineUsersListUsersPaginationResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```go
request := &fern.InlineUsersInlineUsersListWithDoubleOffsetPaginationRequest{}
client.InlineUsersInlineUsers.InlineUsersInlineUsersListWithDoubleOffsetPagination(
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

**order:** `*fern.InlineUsersOrder` 
    
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

<details><summary><code>client.InlineUsersInlineUsers.InlineUsersInlineUsersListWithBodyOffsetPagination(request) -> *fern.InlineUsersListUsersPaginationResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```go
request := &fern.InlineUsersInlineUsersListWithBodyOffsetPaginationRequest{}
client.InlineUsersInlineUsers.InlineUsersInlineUsersListWithBodyOffsetPagination(
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

**pagination:** `*fern.InlineUsersWithPage` 

The object that contains the offset used for pagination
in order to fetch the next page of results.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.InlineUsersInlineUsers.InlineUsersInlineUsersListWithOffsetStepPagination() -> *fern.InlineUsersListUsersPaginationResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```go
request := &fern.InlineUsersInlineUsersListWithOffsetStepPaginationRequest{}
client.InlineUsersInlineUsers.InlineUsersInlineUsersListWithOffsetStepPagination(
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

**order:** `*fern.InlineUsersOrder` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.InlineUsersInlineUsers.InlineUsersInlineUsersListWithOffsetPaginationHasNextPage() -> *fern.InlineUsersListUsersPaginationResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```go
request := &fern.InlineUsersInlineUsersListWithOffsetPaginationHasNextPageRequest{}
client.InlineUsersInlineUsers.InlineUsersInlineUsersListWithOffsetPaginationHasNextPage(
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

**order:** `*fern.InlineUsersOrder` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.InlineUsersInlineUsers.InlineUsersInlineUsersListWithExtendedResults() -> *fern.InlineUsersListUsersExtendedResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```go
request := &fern.InlineUsersInlineUsersListWithExtendedResultsRequest{}
client.InlineUsersInlineUsers.InlineUsersInlineUsersListWithExtendedResults(
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

**cursor:** `*string` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.InlineUsersInlineUsers.InlineUsersInlineUsersListWithExtendedResultsAndOptionalData() -> *fern.InlineUsersListUsersExtendedOptionalListResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```go
request := &fern.InlineUsersInlineUsersListWithExtendedResultsAndOptionalDataRequest{}
client.InlineUsersInlineUsers.InlineUsersInlineUsersListWithExtendedResultsAndOptionalData(
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

**cursor:** `*string` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.InlineUsersInlineUsers.InlineUsersInlineUsersListUsernames() -> *fern.UsernameCursor</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```go
request := &fern.InlineUsersInlineUsersListUsernamesRequest{}
client.InlineUsersInlineUsers.InlineUsersInlineUsersListUsernames(
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

<details><summary><code>client.InlineUsersInlineUsers.InlineUsersInlineUsersListWithGlobalConfig() -> *fern.InlineUsersUsernameContainer</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```go
request := &fern.InlineUsersInlineUsersListWithGlobalConfigRequest{}
client.InlineUsersInlineUsers.InlineUsersInlineUsersListWithGlobalConfig(
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

**offset:** `*int` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## Users
<details><summary><code>client.Users.Listwithcursorpagination() -> *fern.ListUsersPaginationResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```go
request := &fern.UsersListWithCursorPaginationRequest{}
client.Users.Listwithcursorpagination(
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

<details><summary><code>client.Users.Listwithmixedtypecursorpagination() -> *fern.ListUsersMixedTypePaginationResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```go
request := &fern.UsersListWithMixedTypeCursorPaginationRequest{}
client.Users.Listwithmixedtypecursorpagination(
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

**cursor:** `*string` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.Users.Listwithbodycursorpagination(request) -> *fern.ListUsersPaginationResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```go
request := &fern.UsersListWithBodyCursorPaginationRequest{}
client.Users.Listwithbodycursorpagination(
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

<details><summary><code>client.Users.Listwithtoplevelbodycursorpagination(request) -> *fern.ListUsersTopLevelCursorPaginationResponse</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Pagination endpoint with a top-level cursor field in the request body.
This tests that the mock server correctly ignores cursor mismatches
when getNextPage() is called with a different cursor value.
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
request := &fern.UsersListWithTopLevelBodyCursorPaginationRequest{}
client.Users.Listwithtoplevelbodycursorpagination(
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

**cursor:** `*string` 

The cursor used for pagination in order to fetch
the next page of results.
    
</dd>
</dl>

<dl>
<dd>

**filter:** `*string` — An optional filter to apply to the results.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.Users.Listwithoffsetpagination() -> *fern.ListUsersPaginationResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```go
request := &fern.UsersListWithOffsetPaginationRequest{}
client.Users.Listwithoffsetpagination(
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

<details><summary><code>client.Users.Listwithdoubleoffsetpagination() -> *fern.ListUsersPaginationResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```go
request := &fern.UsersListWithDoubleOffsetPaginationRequest{}
client.Users.Listwithdoubleoffsetpagination(
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

<details><summary><code>client.Users.Listwithbodyoffsetpagination(request) -> *fern.ListUsersPaginationResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```go
request := &fern.UsersListWithBodyOffsetPaginationRequest{}
client.Users.Listwithbodyoffsetpagination(
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

<details><summary><code>client.Users.Listwithoffsetsteppagination() -> *fern.ListUsersPaginationResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```go
request := &fern.UsersListWithOffsetStepPaginationRequest{}
client.Users.Listwithoffsetsteppagination(
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

<details><summary><code>client.Users.Listwithoffsetpaginationhasnextpage() -> *fern.ListUsersPaginationResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```go
request := &fern.UsersListWithOffsetPaginationHasNextPageRequest{}
client.Users.Listwithoffsetpaginationhasnextpage(
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

<details><summary><code>client.Users.Listwithextendedresults() -> *fern.ListUsersExtendedResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```go
request := &fern.UsersListWithExtendedResultsRequest{}
client.Users.Listwithextendedresults(
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

**cursor:** `*string` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.Users.Listwithextendedresultsandoptionaldata() -> *fern.ListUsersExtendedOptionalListResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```go
request := &fern.UsersListWithExtendedResultsAndOptionalDataRequest{}
client.Users.Listwithextendedresultsandoptionaldata(
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

**cursor:** `*string` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.Users.Listusernames() -> *fern.UsernameCursor</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```go
request := &fern.UsersListUsernamesRequest{}
client.Users.Listusernames(
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

<details><summary><code>client.Users.Listusernameswithoptionalresponse() -> *fern.UsernameCursor</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```go
request := &fern.UsersListUsernamesWithOptionalResponseRequest{}
client.Users.Listusernameswithoptionalresponse(
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

<details><summary><code>client.Users.Listwithglobalconfig() -> *fern.UsernameContainer</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```go
request := &fern.UsersListWithGlobalConfigRequest{}
client.Users.Listwithglobalconfig(
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

**offset:** `*int` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.Users.Listwithoptionaldata() -> *fern.ListUsersOptionalDataPaginationResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```go
request := &fern.UsersListWithOptionalDataRequest{}
client.Users.Listwithoptionaldata(
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

**page:** `*int` — Defaults to first page
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.Users.Listwithaliaseddata() -> *fern.ListUsersAliasedDataPaginationResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```go
request := &fern.UsersListWithAliasedDataRequest{}
client.Users.Listwithaliaseddata(
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

