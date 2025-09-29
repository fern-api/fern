# Reference
## Conversations
<details><summary><code>client.Complex.<a href="/src/SeedPagination/Complex/ComplexClient.cs">SearchAsync</a>(index, SearchRequest { ... }) -> Core.Pager<Conversation></code></summary>
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
            Operator = SingleFilterSearchRequestOperator.Equals,
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
<details><summary><code>client.InlineUsers.InlineUsers.<a href="/src/SeedPagination/InlineUsers/InlineUsers/InlineUsersClient.cs">ListWithCursorPaginationAsync</a>(InlineUsers.ListUsersCursorPaginationRequest { ... }) -> Core.Pager<InlineUsers.User></code></summary>
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

**request:** `InlineUsers.ListUsersCursorPaginationRequest` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.InlineUsers.InlineUsers.<a href="/src/SeedPagination/InlineUsers/InlineUsers/InlineUsersClient.cs">ListWithMixedTypeCursorPaginationAsync</a>(InlineUsers.ListUsersMixedTypeCursorPaginationRequest { ... }) -> Core.Pager<InlineUsers.User></code></summary>
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

**request:** `InlineUsers.ListUsersMixedTypeCursorPaginationRequest` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.InlineUsers.InlineUsers.<a href="/src/SeedPagination/InlineUsers/InlineUsers/InlineUsersClient.cs">ListWithBodyCursorPaginationAsync</a>(InlineUsers.ListUsersBodyCursorPaginationRequest { ... }) -> Core.Pager<InlineUsers.User></code></summary>
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

**request:** `InlineUsers.ListUsersBodyCursorPaginationRequest` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.InlineUsers.InlineUsers.<a href="/src/SeedPagination/InlineUsers/InlineUsers/InlineUsersClient.cs">ListWithOffsetPaginationAsync</a>(InlineUsers.ListUsersOffsetPaginationRequest { ... }) -> Core.Pager<InlineUsers.User></code></summary>
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

**request:** `InlineUsers.ListUsersOffsetPaginationRequest` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.InlineUsers.InlineUsers.<a href="/src/SeedPagination/InlineUsers/InlineUsers/InlineUsersClient.cs">ListWithDoubleOffsetPaginationAsync</a>(InlineUsers.ListUsersDoubleOffsetPaginationRequest { ... }) -> Core.Pager<InlineUsers.User></code></summary>
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

**request:** `InlineUsers.ListUsersDoubleOffsetPaginationRequest` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.InlineUsers.InlineUsers.<a href="/src/SeedPagination/InlineUsers/InlineUsers/InlineUsersClient.cs">ListWithBodyOffsetPaginationAsync</a>(InlineUsers.ListUsersBodyOffsetPaginationRequest { ... }) -> Core.Pager<InlineUsers.User></code></summary>
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

**request:** `InlineUsers.ListUsersBodyOffsetPaginationRequest` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.InlineUsers.InlineUsers.<a href="/src/SeedPagination/InlineUsers/InlineUsers/InlineUsersClient.cs">ListWithOffsetStepPaginationAsync</a>(InlineUsers.ListUsersOffsetStepPaginationRequest { ... }) -> Core.Pager<InlineUsers.User></code></summary>
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

**request:** `InlineUsers.ListUsersOffsetStepPaginationRequest` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.InlineUsers.InlineUsers.<a href="/src/SeedPagination/InlineUsers/InlineUsers/InlineUsersClient.cs">ListWithOffsetPaginationHasNextPageAsync</a>(InlineUsers.ListWithOffsetPaginationHasNextPageRequest { ... }) -> Core.Pager<InlineUsers.User></code></summary>
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

**request:** `InlineUsers.ListWithOffsetPaginationHasNextPageRequest` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.InlineUsers.InlineUsers.<a href="/src/SeedPagination/InlineUsers/InlineUsers/InlineUsersClient.cs">ListWithExtendedResultsAsync</a>(InlineUsers.ListUsersExtendedRequest { ... }) -> Core.Pager<InlineUsers.User></code></summary>
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

**request:** `InlineUsers.ListUsersExtendedRequest` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.InlineUsers.InlineUsers.<a href="/src/SeedPagination/InlineUsers/InlineUsers/InlineUsersClient.cs">ListWithExtendedResultsAndOptionalDataAsync</a>(InlineUsers.ListUsersExtendedRequestForOptionalData { ... }) -> Core.Pager<InlineUsers.User></code></summary>
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

**request:** `InlineUsers.ListUsersExtendedRequestForOptionalData` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.InlineUsers.InlineUsers.<a href="/src/SeedPagination/InlineUsers/InlineUsers/InlineUsersClient.cs">ListUsernamesAsync</a>(InlineUsers.ListUsernamesRequest { ... }) -> Core.Pager<string></code></summary>
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

**request:** `InlineUsers.ListUsernamesRequest` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.InlineUsers.InlineUsers.<a href="/src/SeedPagination/InlineUsers/InlineUsers/InlineUsersClient.cs">ListWithGlobalConfigAsync</a>(InlineUsers.ListWithGlobalConfigRequest { ... }) -> Core.Pager<string></code></summary>
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

**request:** `InlineUsers.ListWithGlobalConfigRequest` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## Users
<details><summary><code>client.Users.<a href="/src/SeedPagination/Users/UsersClient.cs">ListWithCursorPaginationAsync</a>(ListUsersCursorPaginationRequest { ... }) -> Core.Pager<User></code></summary>
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

<details><summary><code>client.Users.<a href="/src/SeedPagination/Users/UsersClient.cs">ListWithMixedTypeCursorPaginationAsync</a>(ListUsersMixedTypeCursorPaginationRequest { ... }) -> Core.Pager<User></code></summary>
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

<details><summary><code>client.Users.<a href="/src/SeedPagination/Users/UsersClient.cs">ListWithBodyCursorPaginationAsync</a>(ListUsersBodyCursorPaginationRequest { ... }) -> Core.Pager<User></code></summary>
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

<details><summary><code>client.Users.<a href="/src/SeedPagination/Users/UsersClient.cs">ListWithOffsetPaginationAsync</a>(ListUsersOffsetPaginationRequest { ... }) -> Core.Pager<User></code></summary>
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

<details><summary><code>client.Users.<a href="/src/SeedPagination/Users/UsersClient.cs">ListWithDoubleOffsetPaginationAsync</a>(ListUsersDoubleOffsetPaginationRequest { ... }) -> Core.Pager<User></code></summary>
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

<details><summary><code>client.Users.<a href="/src/SeedPagination/Users/UsersClient.cs">ListWithBodyOffsetPaginationAsync</a>(ListUsersBodyOffsetPaginationRequest { ... }) -> Core.Pager<User></code></summary>
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

<details><summary><code>client.Users.<a href="/src/SeedPagination/Users/UsersClient.cs">ListWithOffsetStepPaginationAsync</a>(ListUsersOffsetStepPaginationRequest { ... }) -> Core.Pager<User></code></summary>
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

<details><summary><code>client.Users.<a href="/src/SeedPagination/Users/UsersClient.cs">ListWithOffsetPaginationHasNextPageAsync</a>(ListWithOffsetPaginationHasNextPageRequest { ... }) -> Core.Pager<User></code></summary>
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

<details><summary><code>client.Users.<a href="/src/SeedPagination/Users/UsersClient.cs">ListWithExtendedResultsAsync</a>(ListUsersExtendedRequest { ... }) -> Core.Pager<User></code></summary>
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

<details><summary><code>client.Users.<a href="/src/SeedPagination/Users/UsersClient.cs">ListWithExtendedResultsAndOptionalDataAsync</a>(ListUsersExtendedRequestForOptionalData { ... }) -> Core.Pager<User></code></summary>
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

<details><summary><code>client.Users.<a href="/src/SeedPagination/Users/UsersClient.cs">ListUsernamesAsync</a>(ListUsernamesRequest { ... }) -> Core.Pager<string></code></summary>
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

<details><summary><code>client.Users.<a href="/src/SeedPagination/Users/UsersClient.cs">ListWithGlobalConfigAsync</a>(ListWithGlobalConfigRequest { ... }) -> Core.Pager<string></code></summary>
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
