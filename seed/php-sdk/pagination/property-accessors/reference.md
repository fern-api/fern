# Reference
## Conversations
<details><summary><code>$client->complex->search($index, $request) -> PaginatedConversationResponse</code></summary>
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
<details><summary><code>$client->inlineUsers->inlineUsers->listWithCursorPagination($request) -> ListUsersPaginationResponse</code></summary>
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

<details><summary><code>$client->inlineUsers->inlineUsers->listWithMixedTypeCursorPagination($request) -> ListUsersMixedTypePaginationResponse</code></summary>
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

<details><summary><code>$client->inlineUsers->inlineUsers->listWithBodyCursorPagination($request) -> ListUsersPaginationResponse</code></summary>
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

<details><summary><code>$client->inlineUsers->inlineUsers->listWithOffsetPagination($request) -> ListUsersPaginationResponse</code></summary>
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

<details><summary><code>$client->inlineUsers->inlineUsers->listWithDoubleOffsetPagination($request) -> ListUsersPaginationResponse</code></summary>
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

<details><summary><code>$client->inlineUsers->inlineUsers->listWithBodyOffsetPagination($request) -> ListUsersPaginationResponse</code></summary>
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

<details><summary><code>$client->inlineUsers->inlineUsers->listWithOffsetStepPagination($request) -> ListUsersPaginationResponse</code></summary>
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

<details><summary><code>$client->inlineUsers->inlineUsers->listWithOffsetPaginationHasNextPage($request) -> ListUsersPaginationResponse</code></summary>
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

<details><summary><code>$client->inlineUsers->inlineUsers->listWithExtendedResults($request) -> ListUsersExtendedResponse</code></summary>
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

<details><summary><code>$client->inlineUsers->inlineUsers->listWithExtendedResultsAndOptionalData($request) -> ListUsersExtendedOptionalListResponse</code></summary>
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

<details><summary><code>$client->inlineUsers->inlineUsers->listUsernames($request) -> UsernameCursor</code></summary>
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

<details><summary><code>$client->inlineUsers->inlineUsers->listWithGlobalConfig($request) -> UsernameContainer</code></summary>
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
<details><summary><code>$client->users->listWithCursorPagination($request) -> ListUsersPaginationResponse</code></summary>
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

<details><summary><code>$client->users->listWithMixedTypeCursorPagination($request) -> ListUsersMixedTypePaginationResponse</code></summary>
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

<details><summary><code>$client->users->listWithBodyCursorPagination($request) -> ListUsersPaginationResponse</code></summary>
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

<details><summary><code>$client->users->listWithOffsetPagination($request) -> ListUsersPaginationResponse</code></summary>
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

<details><summary><code>$client->users->listWithDoubleOffsetPagination($request) -> ListUsersPaginationResponse</code></summary>
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

<details><summary><code>$client->users->listWithBodyOffsetPagination($request) -> ListUsersPaginationResponse</code></summary>
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

<details><summary><code>$client->users->listWithOffsetStepPagination($request) -> ListUsersPaginationResponse</code></summary>
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

<details><summary><code>$client->users->listWithOffsetPaginationHasNextPage($request) -> ListUsersPaginationResponse</code></summary>
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

<details><summary><code>$client->users->listWithExtendedResults($request) -> ListUsersExtendedResponse</code></summary>
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

<details><summary><code>$client->users->listWithExtendedResultsAndOptionalData($request) -> ListUsersExtendedOptionalListResponse</code></summary>
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

<details><summary><code>$client->users->listUsernames($request) -> UsernameCursor</code></summary>
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

<details><summary><code>$client->users->listWithGlobalConfig($request) -> UsernameContainer</code></summary>
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
