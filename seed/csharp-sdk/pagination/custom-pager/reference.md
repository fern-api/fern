# Reference
## Conversations
<details><summary><code>client.Complex.<a href="/src/SeedPagination/Complex/ComplexClient.cs">SearchAsync</a>(index, SeedPagination.SearchRequest { ... }) -> SeedPagination.Core.Pager<SeedPagination.Conversation></code></summary>
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
    new SeedPagination.SearchRequest
    {
        Pagination = new SeedPagination.StartingAfterPaging
        {
            PerPage = 1,
            StartingAfter = "starting_after",
        },
        Query = new SeedPagination.SingleFilterSearchRequest
        {
            Field = "field",
            Operator = SeedPagination.SingleFilterSearchRequestOperator.Equals,
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

**request:** `SeedPagination.SearchRequest` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## Users
<details><summary><code>client.Users.<a href="/src/SeedPagination/Users/UsersClient.cs">ListWithCursorPaginationAsync</a>(SeedPagination.ListUsersCursorPaginationRequest { ... }) -> SeedPagination.Core.Pager<SeedPagination.User></code></summary>
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

**request:** `SeedPagination.ListUsersCursorPaginationRequest` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.Users.<a href="/src/SeedPagination/Users/UsersClient.cs">ListWithMixedTypeCursorPaginationAsync</a>(SeedPagination.ListUsersMixedTypeCursorPaginationRequest { ... }) -> SeedPagination.Core.Pager<SeedPagination.User></code></summary>
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

**request:** `SeedPagination.ListUsersMixedTypeCursorPaginationRequest` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.Users.<a href="/src/SeedPagination/Users/UsersClient.cs">ListWithBodyCursorPaginationAsync</a>(SeedPagination.ListUsersBodyCursorPaginationRequest { ... }) -> SeedPagination.Core.Pager<SeedPagination.User></code></summary>
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

**request:** `SeedPagination.ListUsersBodyCursorPaginationRequest` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.Users.<a href="/src/SeedPagination/Users/UsersClient.cs">ListWithOffsetPaginationAsync</a>(SeedPagination.ListUsersOffsetPaginationRequest { ... }) -> SeedPagination.Core.Pager<SeedPagination.User></code></summary>
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

**request:** `SeedPagination.ListUsersOffsetPaginationRequest` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.Users.<a href="/src/SeedPagination/Users/UsersClient.cs">ListWithDoubleOffsetPaginationAsync</a>(SeedPagination.ListUsersDoubleOffsetPaginationRequest { ... }) -> SeedPagination.Core.Pager<SeedPagination.User></code></summary>
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

**request:** `SeedPagination.ListUsersDoubleOffsetPaginationRequest` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.Users.<a href="/src/SeedPagination/Users/UsersClient.cs">ListWithBodyOffsetPaginationAsync</a>(SeedPagination.ListUsersBodyOffsetPaginationRequest { ... }) -> SeedPagination.Core.Pager<SeedPagination.User></code></summary>
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

**request:** `SeedPagination.ListUsersBodyOffsetPaginationRequest` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.Users.<a href="/src/SeedPagination/Users/UsersClient.cs">ListWithOffsetStepPaginationAsync</a>(SeedPagination.ListUsersOffsetStepPaginationRequest { ... }) -> SeedPagination.Core.Pager<SeedPagination.User></code></summary>
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

**request:** `SeedPagination.ListUsersOffsetStepPaginationRequest` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.Users.<a href="/src/SeedPagination/Users/UsersClient.cs">ListWithOffsetPaginationHasNextPageAsync</a>(SeedPagination.ListWithOffsetPaginationHasNextPageRequest { ... }) -> SeedPagination.Core.Pager<SeedPagination.User></code></summary>
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

**request:** `SeedPagination.ListWithOffsetPaginationHasNextPageRequest` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.Users.<a href="/src/SeedPagination/Users/UsersClient.cs">ListWithExtendedResultsAsync</a>(SeedPagination.ListUsersExtendedRequest { ... }) -> SeedPagination.Core.Pager<SeedPagination.User></code></summary>
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

**request:** `SeedPagination.ListUsersExtendedRequest` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.Users.<a href="/src/SeedPagination/Users/UsersClient.cs">ListWithExtendedResultsAndOptionalDataAsync</a>(SeedPagination.ListUsersExtendedRequestForOptionalData { ... }) -> SeedPagination.Core.Pager<SeedPagination.User></code></summary>
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

**request:** `SeedPagination.ListUsersExtendedRequestForOptionalData` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.Users.<a href="/src/SeedPagination/Users/UsersClient.cs">ListUsernamesAsync</a>(SeedPagination.ListUsernamesRequest { ... }) -> SeedPagination.Core.Pager<string></code></summary>
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

**request:** `SeedPagination.ListUsernamesRequest` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.Users.<a href="/src/SeedPagination/Users/UsersClient.cs">ListWithGlobalConfigAsync</a>(SeedPagination.ListWithGlobalConfigRequest { ... }) -> SeedPagination.Core.Pager<string></code></summary>
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

**request:** `SeedPagination.ListWithGlobalConfigRequest` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>
