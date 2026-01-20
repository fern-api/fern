# Reference
## Conversations
<details><summary><code>client.complex.search(index, request) -> SyncPagingIterable&amp;lt;Conversation&amp;gt;</code></summary>
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
                    .field("field")
                    .operator(SingleFilterSearchRequestOperator.EQUALS)
                    .value("value")
                    .build()
            )
        )
        .pagination(
            StartingAfterPaging
                .builder()
                .perPage(1)
                .startingAfter("starting_after")
                .build()
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

**request:** `SearchRequest` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## InlineUsers InlineUsers
<details><summary><code>client.inlineUsers.inlineUsers.listWithCursorPagination() -> SyncPagingIterable&amp;lt;User&amp;gt;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```java
client.inlineUsers().inlineUsers().listWithCursorPagination(
    ListUsersCursorPaginationRequest
        .builder()
        .page(1)
        .perPage(1)
        .order(Order.ASC)
        .startingAfter("starting_after")
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

<details><summary><code>client.inlineUsers.inlineUsers.listWithMixedTypeCursorPagination() -> SyncPagingIterable&amp;lt;User&amp;gt;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```java
client.inlineUsers().inlineUsers().listWithMixedTypeCursorPagination(
    ListUsersMixedTypeCursorPaginationRequest
        .builder()
        .cursor("cursor")
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

<details><summary><code>client.inlineUsers.inlineUsers.listWithBodyCursorPagination(request) -> SyncPagingIterable&amp;lt;User&amp;gt;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```java
client.inlineUsers().inlineUsers().listWithMixedTypeCursorPagination(
    ListUsersMixedTypeCursorPaginationRequest
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

<details><summary><code>client.inlineUsers.inlineUsers.listWithOffsetPagination() -> SyncPagingIterable&amp;lt;User&amp;gt;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```java
client.inlineUsers().inlineUsers().listWithCursorPagination(
    ListUsersCursorPaginationRequest
        .builder()
        .page(1)
        .perPage(1)
        .order(Order.ASC)
        .startingAfter("starting_after")
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

<details><summary><code>client.inlineUsers.inlineUsers.listWithDoubleOffsetPagination() -> SyncPagingIterable&amp;lt;User&amp;gt;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```java
client.inlineUsers().inlineUsers().listWithCursorPagination(
    ListUsersCursorPaginationRequest
        .builder()
        .page(1)
        .perPage(1)
        .order(Order.ASC)
        .startingAfter("starting_after")
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

<details><summary><code>client.inlineUsers.inlineUsers.listWithBodyOffsetPagination(request) -> SyncPagingIterable&amp;lt;User&amp;gt;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```java
client.inlineUsers().inlineUsers().listWithMixedTypeCursorPagination(
    ListUsersMixedTypeCursorPaginationRequest
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

<details><summary><code>client.inlineUsers.inlineUsers.listWithOffsetStepPagination() -> SyncPagingIterable&amp;lt;User&amp;gt;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```java
client.inlineUsers().inlineUsers().listWithOffsetStepPagination(
    ListUsersOffsetStepPaginationRequest
        .builder()
        .page(1)
        .limit(1)
        .order(Order.ASC)
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

<details><summary><code>client.inlineUsers.inlineUsers.listWithOffsetPaginationHasNextPage() -> SyncPagingIterable&amp;lt;User&amp;gt;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```java
client.inlineUsers().inlineUsers().listWithOffsetStepPagination(
    ListUsersOffsetStepPaginationRequest
        .builder()
        .page(1)
        .limit(1)
        .order(Order.ASC)
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

<details><summary><code>client.inlineUsers.inlineUsers.listWithExtendedResults() -> SyncPagingIterable&amp;lt;User&amp;gt;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```java
client.inlineUsers().inlineUsers().listWithExtendedResults(
    ListUsersExtendedRequest
        .builder()
        .cursor(UUID.fromString("d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32"))
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

**cursor:** `Optional<UUID>` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.inlineUsers.inlineUsers.listWithExtendedResultsAndOptionalData() -> SyncPagingIterable&amp;lt;User&amp;gt;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```java
client.inlineUsers().inlineUsers().listWithExtendedResults(
    ListUsersExtendedRequest
        .builder()
        .cursor(UUID.fromString("d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32"))
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

**cursor:** `Optional<UUID>` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.inlineUsers.inlineUsers.listUsernames() -> SyncPagingIterable&amp;lt;String&amp;gt;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```java
client.inlineUsers().inlineUsers().listWithCursorPagination(
    ListUsersCursorPaginationRequest
        .builder()
        .startingAfter("starting_after")
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

<details><summary><code>client.inlineUsers.inlineUsers.listWithGlobalConfig() -> SyncPagingIterable&amp;lt;String&amp;gt;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```java
client.inlineUsers().inlineUsers().listWithGlobalConfig(
    ListWithGlobalConfigRequest
        .builder()
        .offset(1)
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
<details><summary><code>client.users.listWithCursorPagination() -> SyncPagingIterable&amp;lt;User&amp;gt;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```java
client.users().listWithCursorPagination(
    ListUsersCursorPaginationRequest
        .builder()
        .page(1)
        .perPage(1)
        .order(Order.ASC)
        .startingAfter("starting_after")
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

<details><summary><code>client.users.listWithMixedTypeCursorPagination() -> SyncPagingIterable&amp;lt;User&amp;gt;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```java
client.users().listWithMixedTypeCursorPagination(
    ListUsersMixedTypeCursorPaginationRequest
        .builder()
        .cursor("cursor")
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

<details><summary><code>client.users.listWithBodyCursorPagination(request) -> SyncPagingIterable&amp;lt;User&amp;gt;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```java
client.users().listWithMixedTypeCursorPagination(
    ListUsersMixedTypeCursorPaginationRequest
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

<details><summary><code>client.users.listWithTopLevelBodyCursorPagination(request) -> SyncPagingIterable&amp;lt;User&amp;gt;</code></summary>
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
client.users().listWithTopLevelBodyCursorPagination(
    ListUsersTopLevelBodyCursorPaginationRequest
        .builder()
        .cursor("initial_cursor")
        .filter("active")
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

<details><summary><code>client.users.listWithOffsetPagination() -> SyncPagingIterable&amp;lt;User&amp;gt;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```java
client.users().listWithCursorPagination(
    ListUsersCursorPaginationRequest
        .builder()
        .page(1)
        .perPage(1)
        .order(Order.ASC)
        .startingAfter("starting_after")
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

<details><summary><code>client.users.listWithDoubleOffsetPagination() -> SyncPagingIterable&amp;lt;User&amp;gt;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```java
client.users().listWithCursorPagination(
    ListUsersCursorPaginationRequest
        .builder()
        .page(1)
        .perPage(1)
        .order(Order.ASC)
        .startingAfter("starting_after")
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

<details><summary><code>client.users.listWithBodyOffsetPagination(request) -> SyncPagingIterable&amp;lt;User&amp;gt;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```java
client.users().listWithMixedTypeCursorPagination(
    ListUsersMixedTypeCursorPaginationRequest
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

<details><summary><code>client.users.listWithOffsetStepPagination() -> SyncPagingIterable&amp;lt;User&amp;gt;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```java
client.users().listWithOffsetStepPagination(
    ListUsersOffsetStepPaginationRequest
        .builder()
        .page(1)
        .limit(1)
        .order(Order.ASC)
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

<details><summary><code>client.users.listWithOffsetPaginationHasNextPage() -> SyncPagingIterable&amp;lt;User&amp;gt;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```java
client.users().listWithOffsetStepPagination(
    ListUsersOffsetStepPaginationRequest
        .builder()
        .page(1)
        .limit(1)
        .order(Order.ASC)
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

<details><summary><code>client.users.listWithExtendedResults() -> SyncPagingIterable&amp;lt;User&amp;gt;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```java
client.users().listWithExtendedResults(
    ListUsersExtendedRequest
        .builder()
        .cursor(UUID.fromString("d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32"))
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

**cursor:** `Optional<UUID>` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.users.listWithExtendedResultsAndOptionalData() -> SyncPagingIterable&amp;lt;User&amp;gt;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```java
client.users().listWithExtendedResults(
    ListUsersExtendedRequest
        .builder()
        .cursor(UUID.fromString("d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32"))
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

**cursor:** `Optional<UUID>` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.users.listUsernames() -> SyncPagingIterable&amp;lt;String&amp;gt;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```java
client.users().listWithCursorPagination(
    ListUsersCursorPaginationRequest
        .builder()
        .startingAfter("starting_after")
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

<details><summary><code>client.users.listUsernamesWithOptionalResponse() -> SyncPagingIterable&amp;lt;String&amp;gt;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```java
client.users().listWithCursorPagination(
    ListUsersCursorPaginationRequest
        .builder()
        .startingAfter("starting_after")
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

<details><summary><code>client.users.listWithGlobalConfig() -> SyncPagingIterable&amp;lt;String&amp;gt;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```java
client.users().listWithGlobalConfig(
    ListWithGlobalConfigRequest
        .builder()
        .offset(1)
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

<details><summary><code>client.users.listWithOptionalData() -> SyncPagingIterable&amp;lt;User&amp;gt;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```java
client.users().listWithOptionalData(
    ListUsersOptionalDataRequest
        .builder()
        .page(1)
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
