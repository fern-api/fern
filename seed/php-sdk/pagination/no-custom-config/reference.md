# Reference
## Complex
<details><summary><code>$client-&gt;complex-&gt;search($index, $request) -> ?PaginatedConversationResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```php
$client->complex->search(
    'index',
    new SearchRequest([
        'query' => new SingleFilterSearchRequest([]),
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

**$index:** `string` 
    
</dd>
</dl>

<dl>
<dd>

**$pagination:** `?StartingAfterPaging` 
    
</dd>
</dl>

<dl>
<dd>

**$query:** `SingleFilterSearchRequest|MultipleFilterSearchRequest` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## InlineUsersInlineUsers
<details><summary><code>$client-&gt;inlineUsersInlineUsers-&gt;inlineUsersInlineUsersListWithCursorPagination($request) -> ?InlineUsersListUsersPaginationResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```php
$client->inlineUsersInlineUsers->inlineUsersInlineUsersListWithCursorPagination(
    new InlineUsersInlineUsersListWithCursorPaginationRequest([]),
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

**$page:** `?int` — Defaults to first page
    
</dd>
</dl>

<dl>
<dd>

**$perPage:** `?int` — Defaults to per page
    
</dd>
</dl>

<dl>
<dd>

**$order:** `?string` 
    
</dd>
</dl>

<dl>
<dd>

**$startingAfter:** `?string` 

The cursor used for pagination in order to fetch
the next page of results.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>$client-&gt;inlineUsersInlineUsers-&gt;inlineUsersInlineUsersListWithMixedTypeCursorPagination($request) -> ?InlineUsersListUsersMixedTypePaginationResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```php
$client->inlineUsersInlineUsers->inlineUsersInlineUsersListWithMixedTypeCursorPagination(
    new InlineUsersInlineUsersListWithMixedTypeCursorPaginationRequest([]),
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

**$cursor:** `?string` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>$client-&gt;inlineUsersInlineUsers-&gt;inlineUsersInlineUsersListWithBodyCursorPagination($request) -> ?InlineUsersListUsersPaginationResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```php
$client->inlineUsersInlineUsers->inlineUsersInlineUsersListWithBodyCursorPagination(
    new InlineUsersInlineUsersListWithBodyCursorPaginationRequest([]),
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

**$pagination:** `?InlineUsersWithCursor` 

The object that contains the cursor used for pagination
in order to fetch the next page of results.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>$client-&gt;inlineUsersInlineUsers-&gt;inlineUsersInlineUsersListWithOffsetPagination($request) -> ?InlineUsersListUsersPaginationResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```php
$client->inlineUsersInlineUsers->inlineUsersInlineUsersListWithOffsetPagination(
    new InlineUsersInlineUsersListWithOffsetPaginationRequest([]),
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

**$page:** `?int` — Defaults to first page
    
</dd>
</dl>

<dl>
<dd>

**$perPage:** `?int` — Defaults to per page
    
</dd>
</dl>

<dl>
<dd>

**$order:** `?string` 
    
</dd>
</dl>

<dl>
<dd>

**$startingAfter:** `?string` 

The cursor used for pagination in order to fetch
the next page of results.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>$client-&gt;inlineUsersInlineUsers-&gt;inlineUsersInlineUsersListWithDoubleOffsetPagination($request) -> ?InlineUsersListUsersPaginationResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```php
$client->inlineUsersInlineUsers->inlineUsersInlineUsersListWithDoubleOffsetPagination(
    new InlineUsersInlineUsersListWithDoubleOffsetPaginationRequest([]),
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

**$page:** `?float` — Defaults to first page
    
</dd>
</dl>

<dl>
<dd>

**$perPage:** `?float` — Defaults to per page
    
</dd>
</dl>

<dl>
<dd>

**$order:** `?string` 
    
</dd>
</dl>

<dl>
<dd>

**$startingAfter:** `?string` 

The cursor used for pagination in order to fetch
the next page of results.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>$client-&gt;inlineUsersInlineUsers-&gt;inlineUsersInlineUsersListWithBodyOffsetPagination($request) -> ?InlineUsersListUsersPaginationResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```php
$client->inlineUsersInlineUsers->inlineUsersInlineUsersListWithBodyOffsetPagination(
    new InlineUsersInlineUsersListWithBodyOffsetPaginationRequest([]),
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

**$pagination:** `?InlineUsersWithPage` 

The object that contains the offset used for pagination
in order to fetch the next page of results.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>$client-&gt;inlineUsersInlineUsers-&gt;inlineUsersInlineUsersListWithOffsetStepPagination($request) -> ?InlineUsersListUsersPaginationResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```php
$client->inlineUsersInlineUsers->inlineUsersInlineUsersListWithOffsetStepPagination(
    new InlineUsersInlineUsersListWithOffsetStepPaginationRequest([]),
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

**$page:** `?int` — Defaults to first page
    
</dd>
</dl>

<dl>
<dd>

**$limit:** `?int` 

The maximum number of elements to return.
This is also used as the step size in this
paginated endpoint.
    
</dd>
</dl>

<dl>
<dd>

**$order:** `?string` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>$client-&gt;inlineUsersInlineUsers-&gt;inlineUsersInlineUsersListWithOffsetPaginationHasNextPage($request) -> ?InlineUsersListUsersPaginationResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```php
$client->inlineUsersInlineUsers->inlineUsersInlineUsersListWithOffsetPaginationHasNextPage(
    new InlineUsersInlineUsersListWithOffsetPaginationHasNextPageRequest([]),
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

**$page:** `?int` — Defaults to first page
    
</dd>
</dl>

<dl>
<dd>

**$limit:** `?int` 

The maximum number of elements to return.
This is also used as the step size in this
paginated endpoint.
    
</dd>
</dl>

<dl>
<dd>

**$order:** `?string` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>$client-&gt;inlineUsersInlineUsers-&gt;inlineUsersInlineUsersListWithExtendedResults($request) -> ?InlineUsersListUsersExtendedResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```php
$client->inlineUsersInlineUsers->inlineUsersInlineUsersListWithExtendedResults(
    new InlineUsersInlineUsersListWithExtendedResultsRequest([]),
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

**$cursor:** `?string` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>$client-&gt;inlineUsersInlineUsers-&gt;inlineUsersInlineUsersListWithExtendedResultsAndOptionalData($request) -> ?InlineUsersListUsersExtendedOptionalListResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```php
$client->inlineUsersInlineUsers->inlineUsersInlineUsersListWithExtendedResultsAndOptionalData(
    new InlineUsersInlineUsersListWithExtendedResultsAndOptionalDataRequest([]),
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

**$cursor:** `?string` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>$client-&gt;inlineUsersInlineUsers-&gt;inlineUsersInlineUsersListUsernames($request) -> ?UsernameCursor</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```php
$client->inlineUsersInlineUsers->inlineUsersInlineUsersListUsernames(
    new InlineUsersInlineUsersListUsernamesRequest([]),
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

**$startingAfter:** `?string` 

The cursor used for pagination in order to fetch
the next page of results.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>$client-&gt;inlineUsersInlineUsers-&gt;inlineUsersInlineUsersListWithGlobalConfig($request) -> ?InlineUsersUsernameContainer</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```php
$client->inlineUsersInlineUsers->inlineUsersInlineUsersListWithGlobalConfig(
    new InlineUsersInlineUsersListWithGlobalConfigRequest([]),
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

**$offset:** `?int` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## Users
<details><summary><code>$client-&gt;users-&gt;listwithcursorpagination($request) -> ?ListUsersPaginationResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```php
$client->users->listwithcursorpagination(
    new UsersListWithCursorPaginationRequest([]),
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

**$page:** `?int` — Defaults to first page
    
</dd>
</dl>

<dl>
<dd>

**$perPage:** `?int` — Defaults to per page
    
</dd>
</dl>

<dl>
<dd>

**$order:** `?string` 
    
</dd>
</dl>

<dl>
<dd>

**$startingAfter:** `?string` 

The cursor used for pagination in order to fetch
the next page of results.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>$client-&gt;users-&gt;listwithmixedtypecursorpagination($request) -> ?ListUsersMixedTypePaginationResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```php
$client->users->listwithmixedtypecursorpagination(
    new UsersListWithMixedTypeCursorPaginationRequest([]),
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

**$cursor:** `?string` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>$client-&gt;users-&gt;listwithbodycursorpagination($request) -> ?ListUsersPaginationResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```php
$client->users->listwithbodycursorpagination(
    new UsersListWithBodyCursorPaginationRequest([]),
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

**$pagination:** `?WithCursor` 

The object that contains the cursor used for pagination
in order to fetch the next page of results.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>$client-&gt;users-&gt;listwithtoplevelbodycursorpagination($request) -> ?ListUsersTopLevelCursorPaginationResponse</code></summary>
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

```php
$client->users->listwithtoplevelbodycursorpagination(
    new UsersListWithTopLevelBodyCursorPaginationRequest([]),
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

**$cursor:** `?string` 

The cursor used for pagination in order to fetch
the next page of results.
    
</dd>
</dl>

<dl>
<dd>

**$filter:** `?string` — An optional filter to apply to the results.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>$client-&gt;users-&gt;listwithoffsetpagination($request) -> ?ListUsersPaginationResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```php
$client->users->listwithoffsetpagination(
    new UsersListWithOffsetPaginationRequest([]),
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

**$page:** `?int` — Defaults to first page
    
</dd>
</dl>

<dl>
<dd>

**$perPage:** `?int` — Defaults to per page
    
</dd>
</dl>

<dl>
<dd>

**$order:** `?string` 
    
</dd>
</dl>

<dl>
<dd>

**$startingAfter:** `?string` 

The cursor used for pagination in order to fetch
the next page of results.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>$client-&gt;users-&gt;listwithdoubleoffsetpagination($request) -> ?ListUsersPaginationResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```php
$client->users->listwithdoubleoffsetpagination(
    new UsersListWithDoubleOffsetPaginationRequest([]),
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

**$page:** `?float` — Defaults to first page
    
</dd>
</dl>

<dl>
<dd>

**$perPage:** `?float` — Defaults to per page
    
</dd>
</dl>

<dl>
<dd>

**$order:** `?string` 
    
</dd>
</dl>

<dl>
<dd>

**$startingAfter:** `?string` 

The cursor used for pagination in order to fetch
the next page of results.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>$client-&gt;users-&gt;listwithbodyoffsetpagination($request) -> ?ListUsersPaginationResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```php
$client->users->listwithbodyoffsetpagination(
    new UsersListWithBodyOffsetPaginationRequest([]),
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

**$pagination:** `?WithPage` 

The object that contains the offset used for pagination
in order to fetch the next page of results.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>$client-&gt;users-&gt;listwithoffsetsteppagination($request) -> ?ListUsersPaginationResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```php
$client->users->listwithoffsetsteppagination(
    new UsersListWithOffsetStepPaginationRequest([]),
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

**$page:** `?int` — Defaults to first page
    
</dd>
</dl>

<dl>
<dd>

**$limit:** `?int` 

The maximum number of elements to return.
This is also used as the step size in this
paginated endpoint.
    
</dd>
</dl>

<dl>
<dd>

**$order:** `?string` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>$client-&gt;users-&gt;listwithoffsetpaginationhasnextpage($request) -> ?ListUsersPaginationResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```php
$client->users->listwithoffsetpaginationhasnextpage(
    new UsersListWithOffsetPaginationHasNextPageRequest([]),
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

**$page:** `?int` — Defaults to first page
    
</dd>
</dl>

<dl>
<dd>

**$limit:** `?int` 

The maximum number of elements to return.
This is also used as the step size in this
paginated endpoint.
    
</dd>
</dl>

<dl>
<dd>

**$order:** `?string` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>$client-&gt;users-&gt;listwithextendedresults($request) -> ?ListUsersExtendedResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```php
$client->users->listwithextendedresults(
    new UsersListWithExtendedResultsRequest([]),
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

**$cursor:** `?string` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>$client-&gt;users-&gt;listwithextendedresultsandoptionaldata($request) -> ?ListUsersExtendedOptionalListResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```php
$client->users->listwithextendedresultsandoptionaldata(
    new UsersListWithExtendedResultsAndOptionalDataRequest([]),
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

**$cursor:** `?string` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>$client-&gt;users-&gt;listusernames($request) -> ?UsernameCursor</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```php
$client->users->listusernames(
    new UsersListUsernamesRequest([]),
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

**$startingAfter:** `?string` 

The cursor used for pagination in order to fetch
the next page of results.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>$client-&gt;users-&gt;listusernameswithoptionalresponse($request) -> ?UsernameCursor</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```php
$client->users->listusernameswithoptionalresponse(
    new UsersListUsernamesWithOptionalResponseRequest([]),
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

**$startingAfter:** `?string` 

The cursor used for pagination in order to fetch
the next page of results.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>$client-&gt;users-&gt;listwithglobalconfig($request) -> ?UsernameContainer</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```php
$client->users->listwithglobalconfig(
    new UsersListWithGlobalConfigRequest([]),
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

**$offset:** `?int` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>$client-&gt;users-&gt;listwithoptionaldata($request) -> ?ListUsersOptionalDataPaginationResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```php
$client->users->listwithoptionaldata(
    new UsersListWithOptionalDataRequest([]),
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

**$page:** `?int` — Defaults to first page
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>$client-&gt;users-&gt;listwithaliaseddata($request) -> ?ListUsersAliasedDataPaginationResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```php
$client->users->listwithaliaseddata(
    new UsersListWithAliasedDataRequest([]),
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

**$page:** `?int` — Defaults to first page
    
</dd>
</dl>

<dl>
<dd>

**$perPage:** `?int` — Defaults to per page
    
</dd>
</dl>

<dl>
<dd>

**$startingAfter:** `?string` 

The cursor used for pagination in order to fetch
the next page of results.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

