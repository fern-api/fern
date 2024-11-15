# Reference
## Users
<details><summary><code>client.Users.<a href="/src/SeedPagination/Users/UsersClient.cs">ListWithCursorPaginationAsync</a>(ListUsersCursorPaginationRequest { ... }) -> ListUsersPaginationResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
await client.Users.ListWithCursorPaginationAsync(
    new ListUsersCursorPaginationRequest
    {
        Page = 1,
        PerPage = 1,
        Order = Order.Asc,
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

<details><summary><code>client.Users.<a href="/src/SeedPagination/Users/UsersClient.cs">ListWithCursorPaginationPagerAsync</a>(ListUsersCursorPaginationRequest { ... }) -> Pager<User></code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
client.Users.ListWithCursorPaginationPagerAsync(
    new ListUsersCursorPaginationRequest
    {
        Page = 1,
        PerPage = 1,
        Order = Order.Asc,
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

<details><summary><code>client.Users.<a href="/src/SeedPagination/Users/UsersClient.cs">ListWithBodyCursorPaginationAsync</a>(ListUsersBodyCursorPaginationRequest { ... }) -> ListUsersPaginationResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
await client.Users.ListWithBodyCursorPaginationAsync(
    new ListUsersBodyCursorPaginationRequest { Pagination = new WithCursor { Cursor = "cursor" } }
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

<details><summary><code>client.Users.<a href="/src/SeedPagination/Users/UsersClient.cs">ListWithBodyCursorPaginationPagerAsync</a>(ListUsersBodyCursorPaginationRequest { ... }) -> Pager<User></code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
client.Users.ListWithBodyCursorPaginationPagerAsync(
    new ListUsersBodyCursorPaginationRequest { Pagination = new WithCursor { Cursor = "cursor" } }
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

<details><summary><code>client.Users.<a href="/src/SeedPagination/Users/UsersClient.cs">ListWithOffsetPaginationAsync</a>(ListUsersOffsetPaginationRequest { ... }) -> ListUsersPaginationResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
await client.Users.ListWithOffsetPaginationAsync(
    new ListUsersOffsetPaginationRequest
    {
        Page = 1,
        PerPage = 1,
        Order = Order.Asc,
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

<details><summary><code>client.Users.<a href="/src/SeedPagination/Users/UsersClient.cs">ListWithOffsetPaginationPagerAsync</a>(ListUsersOffsetPaginationRequest { ... }) -> Pager<User></code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
client.Users.ListWithOffsetPaginationPagerAsync(
    new ListUsersOffsetPaginationRequest
    {
        Page = 1,
        PerPage = 1,
        Order = Order.Asc,
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

<details><summary><code>client.Users.<a href="/src/SeedPagination/Users/UsersClient.cs">ListWithBodyOffsetPaginationAsync</a>(ListUsersBodyOffsetPaginationRequest { ... }) -> ListUsersPaginationResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
await client.Users.ListWithBodyOffsetPaginationAsync(
    new ListUsersBodyOffsetPaginationRequest { Pagination = new WithPage { Page = 1 } }
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

<details><summary><code>client.Users.<a href="/src/SeedPagination/Users/UsersClient.cs">ListWithBodyOffsetPaginationPagerAsync</a>(ListUsersBodyOffsetPaginationRequest { ... }) -> Pager<User></code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
client.Users.ListWithBodyOffsetPaginationPagerAsync(
    new ListUsersBodyOffsetPaginationRequest { Pagination = new WithPage { Page = 1 } }
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

<details><summary><code>client.Users.<a href="/src/SeedPagination/Users/UsersClient.cs">ListWithOffsetStepPaginationAsync</a>(ListUsersOffsetStepPaginationRequest { ... }) -> ListUsersPaginationResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
await client.Users.ListWithOffsetStepPaginationAsync(
    new ListUsersOffsetStepPaginationRequest
    {
        Page = 1,
        Limit = 1,
        Order = Order.Asc,
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

<details><summary><code>client.Users.<a href="/src/SeedPagination/Users/UsersClient.cs">ListWithOffsetStepPaginationPagerAsync</a>(ListUsersOffsetStepPaginationRequest { ... }) -> Pager<User></code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
client.Users.ListWithOffsetStepPaginationPagerAsync(
    new ListUsersOffsetStepPaginationRequest
    {
        Page = 1,
        Limit = 1,
        Order = Order.Asc,
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

<details><summary><code>client.Users.<a href="/src/SeedPagination/Users/UsersClient.cs">ListWithOffsetPaginationHasNextPageAsync</a>(ListWithOffsetPaginationHasNextPageRequest { ... }) -> ListUsersPaginationResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
await client.Users.ListWithOffsetPaginationHasNextPageAsync(
    new ListWithOffsetPaginationHasNextPageRequest
    {
        Page = 1,
        Limit = 1,
        Order = Order.Asc,
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

<details><summary><code>client.Users.<a href="/src/SeedPagination/Users/UsersClient.cs">ListWithOffsetPaginationHasNextPagePagerAsync</a>(ListWithOffsetPaginationHasNextPageRequest { ... }) -> Pager<User></code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
client.Users.ListWithOffsetPaginationHasNextPagePagerAsync(
    new ListWithOffsetPaginationHasNextPageRequest
    {
        Page = 1,
        Limit = 1,
        Order = Order.Asc,
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

<details><summary><code>client.Users.<a href="/src/SeedPagination/Users/UsersClient.cs">ListWithExtendedResultsAsync</a>(ListUsersExtendedRequest { ... }) -> ListUsersExtendedResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
await client.Users.ListWithExtendedResultsAsync(
    new ListUsersExtendedRequest { Cursor = "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32" }
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

<details><summary><code>client.Users.<a href="/src/SeedPagination/Users/UsersClient.cs">ListWithExtendedResultsPagerAsync</a>(ListUsersExtendedRequest { ... }) -> Pager<User></code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
client.Users.ListWithExtendedResultsPagerAsync(
    new ListUsersExtendedRequest { Cursor = "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32" }
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

<details><summary><code>client.Users.<a href="/src/SeedPagination/Users/UsersClient.cs">ListWithExtendedResultsAndOptionalDataAsync</a>(ListUsersExtendedRequestForOptionalData { ... }) -> ListUsersExtendedOptionalListResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
await client.Users.ListWithExtendedResultsAndOptionalDataAsync(
    new ListUsersExtendedRequestForOptionalData { Cursor = "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32" }
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

<details><summary><code>client.Users.<a href="/src/SeedPagination/Users/UsersClient.cs">ListWithExtendedResultsAndOptionalDataPagerAsync</a>(ListUsersExtendedRequestForOptionalData { ... }) -> Pager<User></code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
client.Users.ListWithExtendedResultsAndOptionalDataPagerAsync(
    new ListUsersExtendedRequestForOptionalData { Cursor = "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32" }
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

<details><summary><code>client.Users.<a href="/src/SeedPagination/Users/UsersClient.cs">ListUsernamesAsync</a>(ListUsernamesRequest { ... }) -> UsernameCursor</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
await client.Users.ListUsernamesAsync(
    new ListUsernamesRequest { StartingAfter = "starting_after" }
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

<details><summary><code>client.Users.<a href="/src/SeedPagination/Users/UsersClient.cs">ListUsernamesPagerAsync</a>(ListUsernamesRequest { ... }) -> Pager<string></code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
client.Users.ListUsernamesPagerAsync(new ListUsernamesRequest { StartingAfter = "starting_after" });
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

<details><summary><code>client.Users.<a href="/src/SeedPagination/Users/UsersClient.cs">ListWithGlobalConfigAsync</a>(ListWithGlobalConfigRequest { ... }) -> UsernameContainer</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
await client.Users.ListWithGlobalConfigAsync(new ListWithGlobalConfigRequest { Offset = 1 });
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

<details><summary><code>client.Users.<a href="/src/SeedPagination/Users/UsersClient.cs">ListWithGlobalConfigPagerAsync</a>(ListWithGlobalConfigRequest { ... }) -> Pager<string></code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
client.Users.ListWithGlobalConfigPagerAsync(new ListWithGlobalConfigRequest { Offset = 1 });
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
