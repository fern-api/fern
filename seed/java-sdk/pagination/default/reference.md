# Reference
## Complex
<details><summary><code>client.complex.search(index, request) -> PaginatedConversationResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```java
client.complex().search(
    "index",
    SearchRequest
        .builder()
        .query(
            SearchRequestQuery.of(
                SingleFilterSearchRequest
                    .builder()
                    .build()
            )
        )
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

**index:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**pagination:** `Optional<StartingAfterPaging>` 
    
</dd>
</dl>

<dl>
<dd>

**query:** `SearchRequestQuery` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## InlineUsersInlineUsers
<details><summary><code>client.inlineUsersInlineUsers.inlineUsersInlineUsersListWithCursorPagination() -> InlineUsersListUsersPaginationResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```java
client.inlineUsersInlineUsers().inlineUsersInlineUsersListWithCursorPagination(
    InlineUsersInlineUsersListWithCursorPaginationRequest
        .builder()
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

**page:** `Optional<Integer>` — Defaults to first page
    
</dd>
</dl>

<dl>
<dd>

**perPage:** `Optional<Integer>` — Defaults to per page
    
</dd>
</dl>

<dl>
<dd>

**order:** `Optional<InlineUsersOrder>` 
    
</dd>
</dl>

<dl>
<dd>

**startingAfter:** `Optional<String>` 

The cursor used for pagination in order to fetch
the next page of results.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.inlineUsersInlineUsers.inlineUsersInlineUsersListWithMixedTypeCursorPagination() -> InlineUsersListUsersMixedTypePaginationResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```java
client.inlineUsersInlineUsers().inlineUsersInlineUsersListWithMixedTypeCursorPagination(
    InlineUsersInlineUsersListWithMixedTypeCursorPaginationRequest
        .builder()
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

**cursor:** `Optional<String>` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.inlineUsersInlineUsers.inlineUsersInlineUsersListWithBodyCursorPagination(request) -> InlineUsersListUsersPaginationResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```java
client.inlineUsersInlineUsers().inlineUsersInlineUsersListWithBodyCursorPagination(
    InlineUsersInlineUsersListWithBodyCursorPaginationRequest
        .builder()
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

**pagination:** `Optional<InlineUsersWithCursor>` 

The object that contains the cursor used for pagination
in order to fetch the next page of results.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.inlineUsersInlineUsers.inlineUsersInlineUsersListWithOffsetPagination() -> InlineUsersListUsersPaginationResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```java
client.inlineUsersInlineUsers().inlineUsersInlineUsersListWithOffsetPagination(
    InlineUsersInlineUsersListWithOffsetPaginationRequest
        .builder()
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

**page:** `Optional<Integer>` — Defaults to first page
    
</dd>
</dl>

<dl>
<dd>

**perPage:** `Optional<Integer>` — Defaults to per page
    
</dd>
</dl>

<dl>
<dd>

**order:** `Optional<InlineUsersOrder>` 
    
</dd>
</dl>

<dl>
<dd>

**startingAfter:** `Optional<String>` 

The cursor used for pagination in order to fetch
the next page of results.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.inlineUsersInlineUsers.inlineUsersInlineUsersListWithDoubleOffsetPagination() -> InlineUsersListUsersPaginationResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```java
client.inlineUsersInlineUsers().inlineUsersInlineUsersListWithDoubleOffsetPagination(
    InlineUsersInlineUsersListWithDoubleOffsetPaginationRequest
        .builder()
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

**page:** `Optional<Double>` — Defaults to first page
    
</dd>
</dl>

<dl>
<dd>

**perPage:** `Optional<Double>` — Defaults to per page
    
</dd>
</dl>

<dl>
<dd>

**order:** `Optional<InlineUsersOrder>` 
    
</dd>
</dl>

<dl>
<dd>

**startingAfter:** `Optional<String>` 

The cursor used for pagination in order to fetch
the next page of results.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.inlineUsersInlineUsers.inlineUsersInlineUsersListWithBodyOffsetPagination(request) -> InlineUsersListUsersPaginationResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```java
client.inlineUsersInlineUsers().inlineUsersInlineUsersListWithBodyOffsetPagination(
    InlineUsersInlineUsersListWithBodyOffsetPaginationRequest
        .builder()
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

**pagination:** `Optional<InlineUsersWithPage>` 

The object that contains the offset used for pagination
in order to fetch the next page of results.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.inlineUsersInlineUsers.inlineUsersInlineUsersListWithOffsetStepPagination() -> InlineUsersListUsersPaginationResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```java
client.inlineUsersInlineUsers().inlineUsersInlineUsersListWithOffsetStepPagination(
    InlineUsersInlineUsersListWithOffsetStepPaginationRequest
        .builder()
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

**page:** `Optional<Integer>` — Defaults to first page
    
</dd>
</dl>

<dl>
<dd>

**limit:** `Optional<Integer>` 

The maximum number of elements to return.
This is also used as the step size in this
paginated endpoint.
    
</dd>
</dl>

<dl>
<dd>

**order:** `Optional<InlineUsersOrder>` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.inlineUsersInlineUsers.inlineUsersInlineUsersListWithOffsetPaginationHasNextPage() -> InlineUsersListUsersPaginationResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```java
client.inlineUsersInlineUsers().inlineUsersInlineUsersListWithOffsetPaginationHasNextPage(
    InlineUsersInlineUsersListWithOffsetPaginationHasNextPageRequest
        .builder()
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

**page:** `Optional<Integer>` — Defaults to first page
    
</dd>
</dl>

<dl>
<dd>

**limit:** `Optional<Integer>` 

The maximum number of elements to return.
This is also used as the step size in this
paginated endpoint.
    
</dd>
</dl>

<dl>
<dd>

**order:** `Optional<InlineUsersOrder>` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.inlineUsersInlineUsers.inlineUsersInlineUsersListWithExtendedResults() -> InlineUsersListUsersExtendedResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```java
client.inlineUsersInlineUsers().inlineUsersInlineUsersListWithExtendedResults(
    InlineUsersInlineUsersListWithExtendedResultsRequest
        .builder()
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

**cursor:** `Optional<String>` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.inlineUsersInlineUsers.inlineUsersInlineUsersListWithExtendedResultsAndOptionalData() -> InlineUsersListUsersExtendedOptionalListResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```java
client.inlineUsersInlineUsers().inlineUsersInlineUsersListWithExtendedResultsAndOptionalData(
    InlineUsersInlineUsersListWithExtendedResultsAndOptionalDataRequest
        .builder()
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

**cursor:** `Optional<String>` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.inlineUsersInlineUsers.inlineUsersInlineUsersListUsernames() -> UsernameCursor</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```java
client.inlineUsersInlineUsers().inlineUsersInlineUsersListUsernames(
    InlineUsersInlineUsersListUsernamesRequest
        .builder()
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

**startingAfter:** `Optional<String>` 

The cursor used for pagination in order to fetch
the next page of results.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.inlineUsersInlineUsers.inlineUsersInlineUsersListWithGlobalConfig() -> InlineUsersUsernameContainer</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```java
client.inlineUsersInlineUsers().inlineUsersInlineUsersListWithGlobalConfig(
    InlineUsersInlineUsersListWithGlobalConfigRequest
        .builder()
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

**offset:** `Optional<Integer>` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## Users
<details><summary><code>client.users.listwithcursorpagination() -> ListUsersPaginationResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```java
client.users().listwithcursorpagination(
    UsersListWithCursorPaginationRequest
        .builder()
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

**page:** `Optional<Integer>` — Defaults to first page
    
</dd>
</dl>

<dl>
<dd>

**perPage:** `Optional<Integer>` — Defaults to per page
    
</dd>
</dl>

<dl>
<dd>

**order:** `Optional<Order>` 
    
</dd>
</dl>

<dl>
<dd>

**startingAfter:** `Optional<String>` 

The cursor used for pagination in order to fetch
the next page of results.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.users.listwithmixedtypecursorpagination() -> ListUsersMixedTypePaginationResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```java
client.users().listwithmixedtypecursorpagination(
    UsersListWithMixedTypeCursorPaginationRequest
        .builder()
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

**cursor:** `Optional<String>` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.users.listwithbodycursorpagination(request) -> ListUsersPaginationResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```java
client.users().listwithbodycursorpagination(
    UsersListWithBodyCursorPaginationRequest
        .builder()
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

**pagination:** `Optional<WithCursor>` 

The object that contains the cursor used for pagination
in order to fetch the next page of results.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.users.listwithtoplevelbodycursorpagination(request) -> ListUsersTopLevelCursorPaginationResponse</code></summary>
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

```java
client.users().listwithtoplevelbodycursorpagination(
    UsersListWithTopLevelBodyCursorPaginationRequest
        .builder()
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

**cursor:** `Optional<String>` 

The cursor used for pagination in order to fetch
the next page of results.
    
</dd>
</dl>

<dl>
<dd>

**filter:** `Optional<String>` — An optional filter to apply to the results.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.users.listwithoffsetpagination() -> ListUsersPaginationResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```java
client.users().listwithoffsetpagination(
    UsersListWithOffsetPaginationRequest
        .builder()
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

**page:** `Optional<Integer>` — Defaults to first page
    
</dd>
</dl>

<dl>
<dd>

**perPage:** `Optional<Integer>` — Defaults to per page
    
</dd>
</dl>

<dl>
<dd>

**order:** `Optional<Order>` 
    
</dd>
</dl>

<dl>
<dd>

**startingAfter:** `Optional<String>` 

The cursor used for pagination in order to fetch
the next page of results.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.users.listwithdoubleoffsetpagination() -> ListUsersPaginationResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```java
client.users().listwithdoubleoffsetpagination(
    UsersListWithDoubleOffsetPaginationRequest
        .builder()
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

**page:** `Optional<Double>` — Defaults to first page
    
</dd>
</dl>

<dl>
<dd>

**perPage:** `Optional<Double>` — Defaults to per page
    
</dd>
</dl>

<dl>
<dd>

**order:** `Optional<Order>` 
    
</dd>
</dl>

<dl>
<dd>

**startingAfter:** `Optional<String>` 

The cursor used for pagination in order to fetch
the next page of results.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.users.listwithbodyoffsetpagination(request) -> ListUsersPaginationResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```java
client.users().listwithbodyoffsetpagination(
    UsersListWithBodyOffsetPaginationRequest
        .builder()
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

**pagination:** `Optional<WithPage>` 

The object that contains the offset used for pagination
in order to fetch the next page of results.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.users.listwithoffsetsteppagination() -> ListUsersPaginationResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```java
client.users().listwithoffsetsteppagination(
    UsersListWithOffsetStepPaginationRequest
        .builder()
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

**page:** `Optional<Integer>` — Defaults to first page
    
</dd>
</dl>

<dl>
<dd>

**limit:** `Optional<Integer>` 

The maximum number of elements to return.
This is also used as the step size in this
paginated endpoint.
    
</dd>
</dl>

<dl>
<dd>

**order:** `Optional<Order>` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.users.listwithoffsetpaginationhasnextpage() -> ListUsersPaginationResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```java
client.users().listwithoffsetpaginationhasnextpage(
    UsersListWithOffsetPaginationHasNextPageRequest
        .builder()
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

**page:** `Optional<Integer>` — Defaults to first page
    
</dd>
</dl>

<dl>
<dd>

**limit:** `Optional<Integer>` 

The maximum number of elements to return.
This is also used as the step size in this
paginated endpoint.
    
</dd>
</dl>

<dl>
<dd>

**order:** `Optional<Order>` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.users.listwithextendedresults() -> ListUsersExtendedResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```java
client.users().listwithextendedresults(
    UsersListWithExtendedResultsRequest
        .builder()
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

**cursor:** `Optional<String>` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.users.listwithextendedresultsandoptionaldata() -> ListUsersExtendedOptionalListResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```java
client.users().listwithextendedresultsandoptionaldata(
    UsersListWithExtendedResultsAndOptionalDataRequest
        .builder()
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

**cursor:** `Optional<String>` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.users.listusernames() -> UsernameCursor</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```java
client.users().listusernames(
    UsersListUsernamesRequest
        .builder()
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

**startingAfter:** `Optional<String>` 

The cursor used for pagination in order to fetch
the next page of results.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.users.listusernameswithoptionalresponse() -> UsernameCursor</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```java
client.users().listusernameswithoptionalresponse(
    UsersListUsernamesWithOptionalResponseRequest
        .builder()
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

**startingAfter:** `Optional<String>` 

The cursor used for pagination in order to fetch
the next page of results.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.users.listwithglobalconfig() -> UsernameContainer</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```java
client.users().listwithglobalconfig(
    UsersListWithGlobalConfigRequest
        .builder()
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

**offset:** `Optional<Integer>` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.users.listwithoptionaldata() -> ListUsersOptionalDataPaginationResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```java
client.users().listwithoptionaldata(
    UsersListWithOptionalDataRequest
        .builder()
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

**page:** `Optional<Integer>` — Defaults to first page
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.users.listwithaliaseddata() -> ListUsersAliasedDataPaginationResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```java
client.users().listwithaliaseddata(
    UsersListWithAliasedDataRequest
        .builder()
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

**page:** `Optional<Integer>` — Defaults to first page
    
</dd>
</dl>

<dl>
<dd>

**perPage:** `Optional<Integer>` — Defaults to per page
    
</dd>
</dl>

<dl>
<dd>

**startingAfter:** `Optional<String>` 

The cursor used for pagination in order to fetch
the next page of results.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

