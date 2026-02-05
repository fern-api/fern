# Reference
## Conversations
<details><summary><code>$client-&gt;complex-&gt;search($index, $request) -> PaginatedConversationResponse</code></summary>
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
        'pagination' => new StartingAfterPaging([
            'perPage' => 1,
            'startingAfter' => 'starting_after',
        ]),
        'query' => new SingleFilterSearchRequest([
            'field' => 'field',
            'operator' => SingleFilterSearchRequestOperator::Equals->value,
            'value' => 'value',
        ]),
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

**$request:** `SearchRequest` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## InlineUsers InlineUsers
<details><summary><code>$client-&gt;inlineUsers-&gt;inlineUsers-&gt;listWithCursorPagination($request) -> ListUsersPaginationResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```php
$client->inlineUsers->inlineUsers->listWithCursorPagination(
    new ListUsersCursorPaginationRequest([
        'page' => 1,
        'perPage' => 1,
        'order' => Order::Asc->value,
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

<details><summary><code>$client-&gt;inlineUsers-&gt;inlineUsers-&gt;listWithMixedTypeCursorPagination($request) -> ListUsersMixedTypePaginationResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```php
$client->inlineUsers->inlineUsers->listWithMixedTypeCursorPagination(
    new ListUsersMixedTypeCursorPaginationRequest([
        'cursor' => 'cursor',
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

**$cursor:** `?string` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>$client-&gt;inlineUsers-&gt;inlineUsers-&gt;listWithBodyCursorPagination($request) -> ListUsersPaginationResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```php
$client->inlineUsers->inlineUsers->listWithMixedTypeCursorPagination(
    new ListUsersMixedTypeCursorPaginationRequest([]),
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

<details><summary><code>$client-&gt;inlineUsers-&gt;inlineUsers-&gt;listWithOffsetPagination($request) -> ListUsersPaginationResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```php
$client->inlineUsers->inlineUsers->listWithCursorPagination(
    new ListUsersCursorPaginationRequest([
        'page' => 1,
        'perPage' => 1,
        'order' => Order::Asc->value,
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

<details><summary><code>$client-&gt;inlineUsers-&gt;inlineUsers-&gt;listWithDoubleOffsetPagination($request) -> ListUsersPaginationResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```php
$client->inlineUsers->inlineUsers->listWithCursorPagination(
    new ListUsersCursorPaginationRequest([
        'page' => 1.1,
        'perPage' => 1.1,
        'order' => Order::Asc->value,
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

<details><summary><code>$client-&gt;inlineUsers-&gt;inlineUsers-&gt;listWithBodyOffsetPagination($request) -> ListUsersPaginationResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```php
$client->inlineUsers->inlineUsers->listWithMixedTypeCursorPagination(
    new ListUsersMixedTypeCursorPaginationRequest([]),
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

<details><summary><code>$client-&gt;inlineUsers-&gt;inlineUsers-&gt;listWithOffsetStepPagination($request) -> ListUsersPaginationResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```php
$client->inlineUsers->inlineUsers->listWithOffsetStepPagination(
    new ListUsersOffsetStepPaginationRequest([
        'page' => 1,
        'limit' => 1,
        'order' => Order::Asc->value,
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

<details><summary><code>$client-&gt;inlineUsers-&gt;inlineUsers-&gt;listWithOffsetPaginationHasNextPage($request) -> ListUsersPaginationResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```php
$client->inlineUsers->inlineUsers->listWithOffsetStepPagination(
    new ListUsersOffsetStepPaginationRequest([
        'page' => 1,
        'limit' => 1,
        'order' => Order::Asc->value,
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

<details><summary><code>$client-&gt;inlineUsers-&gt;inlineUsers-&gt;listWithExtendedResults($request) -> ListUsersExtendedResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```php
$client->inlineUsers->inlineUsers->listWithExtendedResults(
    new ListUsersExtendedRequest([
        'cursor' => 'd5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32',
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

**$cursor:** `?string` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>$client-&gt;inlineUsers-&gt;inlineUsers-&gt;listWithExtendedResultsAndOptionalData($request) -> ListUsersExtendedOptionalListResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```php
$client->inlineUsers->inlineUsers->listWithExtendedResults(
    new ListUsersExtendedRequest([
        'cursor' => 'd5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32',
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

**$cursor:** `?string` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>$client-&gt;inlineUsers-&gt;inlineUsers-&gt;listUsernames($request) -> UsernameCursor</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```php
$client->inlineUsers->inlineUsers->listWithCursorPagination(
    new ListUsersCursorPaginationRequest([
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

<details><summary><code>$client-&gt;inlineUsers-&gt;inlineUsers-&gt;listWithGlobalConfig($request) -> UsernameContainer</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```php
$client->inlineUsers->inlineUsers->listWithGlobalConfig(
    new ListWithGlobalConfigRequest([
        'offset' => 1,
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

**$offset:** `?int` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## Users
<details><summary><code>$client-&gt;users-&gt;listWithCursorPagination($request) -> ListUsersPaginationResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```php
$client->users->listWithCursorPagination(
    new ListUsersCursorPaginationRequest([
        'page' => 1,
        'perPage' => 1,
        'order' => Order::Asc->value,
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

<details><summary><code>$client-&gt;users-&gt;listWithMixedTypeCursorPagination($request) -> ListUsersMixedTypePaginationResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```php
$client->users->listWithMixedTypeCursorPagination(
    new ListUsersMixedTypeCursorPaginationRequest([
        'cursor' => 'cursor',
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

**$cursor:** `?string` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>$client-&gt;users-&gt;listWithBodyCursorPagination($request) -> ListUsersPaginationResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```php
$client->users->listWithMixedTypeCursorPagination(
    new ListUsersMixedTypeCursorPaginationRequest([]),
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

<details><summary><code>$client-&gt;users-&gt;listWithTopLevelBodyCursorPagination($request) -> ListUsersTopLevelCursorPaginationResponse</code></summary>
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
$client->users->listWithTopLevelBodyCursorPagination(
    new ListUsersTopLevelBodyCursorPaginationRequest([
        'cursor' => 'initial_cursor',
        'filter' => 'active',
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

<details><summary><code>$client-&gt;users-&gt;listWithOffsetPagination($request) -> ListUsersPaginationResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```php
$client->users->listWithCursorPagination(
    new ListUsersCursorPaginationRequest([
        'page' => 1,
        'perPage' => 1,
        'order' => Order::Asc->value,
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

<details><summary><code>$client-&gt;users-&gt;listWithDoubleOffsetPagination($request) -> ListUsersPaginationResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```php
$client->users->listWithCursorPagination(
    new ListUsersCursorPaginationRequest([
        'page' => 1.1,
        'perPage' => 1.1,
        'order' => Order::Asc->value,
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

<details><summary><code>$client-&gt;users-&gt;listWithBodyOffsetPagination($request) -> ListUsersPaginationResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```php
$client->users->listWithMixedTypeCursorPagination(
    new ListUsersMixedTypeCursorPaginationRequest([]),
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

<details><summary><code>$client-&gt;users-&gt;listWithOffsetStepPagination($request) -> ListUsersPaginationResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```php
$client->users->listWithOffsetStepPagination(
    new ListUsersOffsetStepPaginationRequest([
        'page' => 1,
        'limit' => 1,
        'order' => Order::Asc->value,
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

<details><summary><code>$client-&gt;users-&gt;listWithOffsetPaginationHasNextPage($request) -> ListUsersPaginationResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```php
$client->users->listWithOffsetStepPagination(
    new ListUsersOffsetStepPaginationRequest([
        'page' => 1,
        'limit' => 1,
        'order' => Order::Asc->value,
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

<details><summary><code>$client-&gt;users-&gt;listWithExtendedResults($request) -> ListUsersExtendedResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```php
$client->users->listWithExtendedResults(
    new ListUsersExtendedRequest([
        'cursor' => 'd5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32',
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

**$cursor:** `?string` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>$client-&gt;users-&gt;listWithExtendedResultsAndOptionalData($request) -> ListUsersExtendedOptionalListResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```php
$client->users->listWithExtendedResults(
    new ListUsersExtendedRequest([
        'cursor' => 'd5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32',
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

**$cursor:** `?string` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>$client-&gt;users-&gt;listUsernames($request) -> UsernameCursor</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```php
$client->users->listWithCursorPagination(
    new ListUsersCursorPaginationRequest([
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

<details><summary><code>$client-&gt;users-&gt;listUsernamesWithOptionalResponse($request) -> ?UsernameCursor</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```php
$client->users->listWithCursorPagination(
    new ListUsersCursorPaginationRequest([
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

<details><summary><code>$client-&gt;users-&gt;listWithGlobalConfig($request) -> UsernameContainer</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```php
$client->users->listWithGlobalConfig(
    new ListWithGlobalConfigRequest([
        'offset' => 1,
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

**$offset:** `?int` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>$client-&gt;users-&gt;listWithOptionalData($request) -> ListUsersOptionalDataPaginationResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```php
$client->users->listWithOptionalData(
    new ListUsersOptionalDataRequest([
        'page' => 1,
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

**$page:** `?int` — Defaults to first page
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>
