# Reference
## Conversations
<details><summary><code>client.Complex.<a href="/src/SeedPagination/Complex/ComplexClient.cs">SearchAsync</a>(index, SearchRequest { ... }) -> Pager&lt;Conversation&gt;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
await client.Complex.SearchAsync(
    "index",
    new SearchRequest
    {
        Pagination = new StartingAfterPaging { PerPage = 1, StartingAfter = "starting_after" },
        Query = new SingleFilterSearchRequest
        {
            Field = "field",
            Operator = SingleFilterSearchRequestOperator.Equals_,
            Value = "value",
        },
    }
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

**index:** `string` 
    
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
<details><summary><code>client.InlineUsers.InlineUsers.<a href="/src/SeedPagination/InlineUsers/InlineUsers/InlineUsersClient_.cs">ListWithCursorPaginationAsync</a>(ListUsersCursorPaginationRequest { ... }) -> Pager&lt;User&gt;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
await client.InlineUsers.InlineUsers.ListWithCursorPaginationAsync(
    new SeedPagination.InlineUsers.ListUsersCursorPaginationRequest
    {
        Page = 1,
        PerPage = 1,
        Order = SeedPagination.InlineUsers.Order.Asc,
        StartingAfter = "starting_after",
    }
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

**request:** `ListUsersCursorPaginationRequest` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.InlineUsers.InlineUsers.<a href="/src/SeedPagination/InlineUsers/InlineUsers/InlineUsersClient_.cs">ListWithMixedTypeCursorPaginationAsync</a>(ListUsersMixedTypeCursorPaginationRequest { ... }) -> Pager&lt;User&gt;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
await client.InlineUsers.InlineUsers.ListWithMixedTypeCursorPaginationAsync(
    new SeedPagination.InlineUsers.ListUsersMixedTypeCursorPaginationRequest { Cursor = "cursor" }
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

**request:** `ListUsersMixedTypeCursorPaginationRequest` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.InlineUsers.InlineUsers.<a href="/src/SeedPagination/InlineUsers/InlineUsers/InlineUsersClient_.cs">ListWithBodyCursorPaginationAsync</a>(ListUsersBodyCursorPaginationRequest { ... }) -> Pager&lt;User&gt;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
await client.InlineUsers.InlineUsers.ListWithBodyCursorPaginationAsync(
    new SeedPagination.InlineUsers.ListUsersBodyCursorPaginationRequest
    {
        Pagination = new SeedPagination.InlineUsers.WithCursor { Cursor = "cursor" },
    }
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

**request:** `ListUsersBodyCursorPaginationRequest` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.InlineUsers.InlineUsers.<a href="/src/SeedPagination/InlineUsers/InlineUsers/InlineUsersClient_.cs">ListWithOffsetPaginationAsync</a>(ListUsersOffsetPaginationRequest { ... }) -> Pager&lt;User&gt;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
await client.InlineUsers.InlineUsers.ListWithOffsetPaginationAsync(
    new SeedPagination.InlineUsers.ListUsersOffsetPaginationRequest
    {
        Page = 1,
        PerPage = 1,
        Order = SeedPagination.InlineUsers.Order.Asc,
        StartingAfter = "starting_after",
    }
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

**request:** `ListUsersOffsetPaginationRequest` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.InlineUsers.InlineUsers.<a href="/src/SeedPagination/InlineUsers/InlineUsers/InlineUsersClient_.cs">ListWithDoubleOffsetPaginationAsync</a>(ListUsersDoubleOffsetPaginationRequest { ... }) -> Pager&lt;User&gt;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
await client.InlineUsers.InlineUsers.ListWithDoubleOffsetPaginationAsync(
    new SeedPagination.InlineUsers.ListUsersDoubleOffsetPaginationRequest
    {
        Page = 1.1,
        PerPage = 1.1,
        Order = SeedPagination.InlineUsers.Order.Asc,
        StartingAfter = "starting_after",
    }
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

**request:** `ListUsersDoubleOffsetPaginationRequest` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.InlineUsers.InlineUsers.<a href="/src/SeedPagination/InlineUsers/InlineUsers/InlineUsersClient_.cs">ListWithBodyOffsetPaginationAsync</a>(ListUsersBodyOffsetPaginationRequest { ... }) -> Pager&lt;User&gt;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
await client.InlineUsers.InlineUsers.ListWithBodyOffsetPaginationAsync(
    new SeedPagination.InlineUsers.ListUsersBodyOffsetPaginationRequest
    {
        Pagination = new SeedPagination.InlineUsers.WithPage { Page = 1 },
    }
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

**request:** `ListUsersBodyOffsetPaginationRequest` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.InlineUsers.InlineUsers.<a href="/src/SeedPagination/InlineUsers/InlineUsers/InlineUsersClient_.cs">ListWithOffsetStepPaginationAsync</a>(ListUsersOffsetStepPaginationRequest { ... }) -> Pager&lt;User&gt;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
await client.InlineUsers.InlineUsers.ListWithOffsetStepPaginationAsync(
    new SeedPagination.InlineUsers.ListUsersOffsetStepPaginationRequest
    {
        Page = 1,
        Limit = 1,
        Order = SeedPagination.InlineUsers.Order.Asc,
    }
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

**request:** `ListUsersOffsetStepPaginationRequest` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.InlineUsers.InlineUsers.<a href="/src/SeedPagination/InlineUsers/InlineUsers/InlineUsersClient_.cs">ListWithOffsetPaginationHasNextPageAsync</a>(ListWithOffsetPaginationHasNextPageRequest { ... }) -> Pager&lt;User&gt;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
await client.InlineUsers.InlineUsers.ListWithOffsetPaginationHasNextPageAsync(
    new SeedPagination.InlineUsers.ListWithOffsetPaginationHasNextPageRequest
    {
        Page = 1,
        Limit = 1,
        Order = SeedPagination.InlineUsers.Order.Asc,
    }
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

**request:** `ListWithOffsetPaginationHasNextPageRequest` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.InlineUsers.InlineUsers.<a href="/src/SeedPagination/InlineUsers/InlineUsers/InlineUsersClient_.cs">ListWithExtendedResultsAsync</a>(ListUsersExtendedRequest { ... }) -> Pager&lt;User&gt;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
await client.InlineUsers.InlineUsers.ListWithExtendedResultsAsync(
    new SeedPagination.InlineUsers.ListUsersExtendedRequest
    {
        Cursor = "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32",
    }
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

**request:** `ListUsersExtendedRequest` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.InlineUsers.InlineUsers.<a href="/src/SeedPagination/InlineUsers/InlineUsers/InlineUsersClient_.cs">ListWithExtendedResultsAndOptionalDataAsync</a>(ListUsersExtendedRequestForOptionalData { ... }) -> Pager&lt;User&gt;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
await client.InlineUsers.InlineUsers.ListWithExtendedResultsAndOptionalDataAsync(
    new SeedPagination.InlineUsers.ListUsersExtendedRequestForOptionalData
    {
        Cursor = "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32",
    }
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

**request:** `ListUsersExtendedRequestForOptionalData` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.InlineUsers.InlineUsers.<a href="/src/SeedPagination/InlineUsers/InlineUsers/InlineUsersClient_.cs">ListUsernamesAsync</a>(ListUsernamesRequest { ... }) -> Pager&lt;string&gt;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
await client.InlineUsers.InlineUsers.ListUsernamesAsync(
    new SeedPagination.InlineUsers.ListUsernamesRequest { StartingAfter = "starting_after" }
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

**request:** `ListUsernamesRequest` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.InlineUsers.InlineUsers.<a href="/src/SeedPagination/InlineUsers/InlineUsers/InlineUsersClient_.cs">ListWithGlobalConfigAsync</a>(ListWithGlobalConfigRequest { ... }) -> Pager&lt;string&gt;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
await client.InlineUsers.InlineUsers.ListWithGlobalConfigAsync(
    new SeedPagination.InlineUsers.ListWithGlobalConfigRequest { Offset = 1 }
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

**request:** `ListWithGlobalConfigRequest` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## Users
<details><summary><code>client.Users.<a href="/src/SeedPagination/Users/UsersClient.cs">ListWithCursorPaginationAsync</a>(ListUsersCursorPaginationRequest { ... }) -> Pager&lt;User&gt;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
await client.Users.ListWithCursorPaginationAsync(
    new SeedPagination.ListUsersCursorPaginationRequest
    {
        Page = 1,
        PerPage = 1,
        Order = SeedPagination.Order.Asc,
        StartingAfter = "starting_after",
    }
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

**request:** `ListUsersCursorPaginationRequest` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.Users.<a href="/src/SeedPagination/Users/UsersClient.cs">ListWithMixedTypeCursorPaginationAsync</a>(ListUsersMixedTypeCursorPaginationRequest { ... }) -> Pager&lt;User&gt;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
await client.Users.ListWithMixedTypeCursorPaginationAsync(
    new SeedPagination.ListUsersMixedTypeCursorPaginationRequest { Cursor = "cursor" }
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

**request:** `ListUsersMixedTypeCursorPaginationRequest` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.Users.<a href="/src/SeedPagination/Users/UsersClient.cs">ListWithBodyCursorPaginationAsync</a>(ListUsersBodyCursorPaginationRequest { ... }) -> Pager&lt;User&gt;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
await client.Users.ListWithBodyCursorPaginationAsync(
    new SeedPagination.ListUsersBodyCursorPaginationRequest
    {
        Pagination = new SeedPagination.WithCursor { Cursor = "cursor" },
    }
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

**request:** `ListUsersBodyCursorPaginationRequest` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.Users.<a href="/src/SeedPagination/Users/UsersClient.cs">ListWithTopLevelBodyCursorPaginationAsync</a>(ListUsersTopLevelBodyCursorPaginationRequest { ... }) -> Pager&lt;User&gt;</code></summary>
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

```csharp
await client.Users.ListWithTopLevelBodyCursorPaginationAsync(
    new ListUsersTopLevelBodyCursorPaginationRequest
    {
        Cursor = "initial_cursor",
        Filter = "active",
    }
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

**request:** `ListUsersTopLevelBodyCursorPaginationRequest` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.Users.<a href="/src/SeedPagination/Users/UsersClient.cs">ListWithOffsetPaginationAsync</a>(ListUsersOffsetPaginationRequest { ... }) -> Pager&lt;User&gt;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
await client.Users.ListWithOffsetPaginationAsync(
    new SeedPagination.ListUsersOffsetPaginationRequest
    {
        Page = 1,
        PerPage = 1,
        Order = SeedPagination.Order.Asc,
        StartingAfter = "starting_after",
    }
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

**request:** `ListUsersOffsetPaginationRequest` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.Users.<a href="/src/SeedPagination/Users/UsersClient.cs">ListWithDoubleOffsetPaginationAsync</a>(ListUsersDoubleOffsetPaginationRequest { ... }) -> Pager&lt;User&gt;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
await client.Users.ListWithDoubleOffsetPaginationAsync(
    new SeedPagination.ListUsersDoubleOffsetPaginationRequest
    {
        Page = 1.1,
        PerPage = 1.1,
        Order = SeedPagination.Order.Asc,
        StartingAfter = "starting_after",
    }
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

**request:** `ListUsersDoubleOffsetPaginationRequest` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.Users.<a href="/src/SeedPagination/Users/UsersClient.cs">ListWithBodyOffsetPaginationAsync</a>(ListUsersBodyOffsetPaginationRequest { ... }) -> Pager&lt;User&gt;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
await client.Users.ListWithBodyOffsetPaginationAsync(
    new SeedPagination.ListUsersBodyOffsetPaginationRequest
    {
        Pagination = new SeedPagination.WithPage { Page = 1 },
    }
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

**request:** `ListUsersBodyOffsetPaginationRequest` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.Users.<a href="/src/SeedPagination/Users/UsersClient.cs">ListWithOffsetStepPaginationAsync</a>(ListUsersOffsetStepPaginationRequest { ... }) -> Pager&lt;User&gt;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
await client.Users.ListWithOffsetStepPaginationAsync(
    new SeedPagination.ListUsersOffsetStepPaginationRequest
    {
        Page = 1,
        Limit = 1,
        Order = SeedPagination.Order.Asc,
    }
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

**request:** `ListUsersOffsetStepPaginationRequest` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.Users.<a href="/src/SeedPagination/Users/UsersClient.cs">ListWithOffsetPaginationHasNextPageAsync</a>(ListWithOffsetPaginationHasNextPageRequest { ... }) -> Pager&lt;User&gt;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
await client.Users.ListWithOffsetPaginationHasNextPageAsync(
    new SeedPagination.ListWithOffsetPaginationHasNextPageRequest
    {
        Page = 1,
        Limit = 1,
        Order = SeedPagination.Order.Asc,
    }
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

**request:** `ListWithOffsetPaginationHasNextPageRequest` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.Users.<a href="/src/SeedPagination/Users/UsersClient.cs">ListWithExtendedResultsAsync</a>(ListUsersExtendedRequest { ... }) -> Pager&lt;User&gt;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
await client.Users.ListWithExtendedResultsAsync(
    new SeedPagination.ListUsersExtendedRequest { Cursor = "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32" }
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

**request:** `ListUsersExtendedRequest` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.Users.<a href="/src/SeedPagination/Users/UsersClient.cs">ListWithExtendedResultsAndOptionalDataAsync</a>(ListUsersExtendedRequestForOptionalData { ... }) -> Pager&lt;User&gt;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
await client.Users.ListWithExtendedResultsAndOptionalDataAsync(
    new SeedPagination.ListUsersExtendedRequestForOptionalData
    {
        Cursor = "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32",
    }
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

**request:** `ListUsersExtendedRequestForOptionalData` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.Users.<a href="/src/SeedPagination/Users/UsersClient.cs">ListUsernamesAsync</a>(ListUsernamesRequest { ... }) -> Pager&lt;string&gt;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
await client.Users.ListUsernamesAsync(
    new SeedPagination.ListUsernamesRequest { StartingAfter = "starting_after" }
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

**request:** `ListUsernamesRequest` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.Users.<a href="/src/SeedPagination/Users/UsersClient.cs">ListUsernamesWithOptionalResponseAsync</a>(ListUsernamesWithOptionalResponseRequest { ... }) -> Pager&lt;string&gt;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
await client.Users.ListUsernamesWithOptionalResponseAsync(
    new ListUsernamesWithOptionalResponseRequest { StartingAfter = "starting_after" }
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

**request:** `ListUsernamesWithOptionalResponseRequest` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.Users.<a href="/src/SeedPagination/Users/UsersClient.cs">ListWithGlobalConfigAsync</a>(ListWithGlobalConfigRequest { ... }) -> Pager&lt;string&gt;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
await client.Users.ListWithGlobalConfigAsync(
    new SeedPagination.ListWithGlobalConfigRequest { Offset = 1 }
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

**request:** `ListWithGlobalConfigRequest` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.Users.<a href="/src/SeedPagination/Users/UsersClient.cs">ListWithOptionalDataAsync</a>(ListUsersOptionalDataRequest { ... }) -> Pager&lt;User&gt;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
await client.Users.ListWithOptionalDataAsync(new ListUsersOptionalDataRequest { Page = 1 });
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

**request:** `ListUsersOptionalDataRequest` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>
