# Reference
## Conversations
<details><summary><code>client.complex.<a href="/src/api/resources/complex/client/Client.ts">search</a>(index, { ...params }) -> core.Page<SeedPagination.Conversation, SeedPagination.PaginatedConversationResponse></code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
const response = await client.complex.search("index", {
    pagination: {
        per_page: 1,
        starting_after: "starting_after"
    },
    query: {
        field: "field",
        operator: "=",
        value: "value"
    }
});
for await (const item of response) {
    console.log(item);
}

// Or you can manually iterate page-by-page
let page = await client.complex.search("index", {
    pagination: {
        per_page: 1,
        starting_after: "starting_after"
    },
    query: {
        field: "field",
        operator: "=",
        value: "value"
    }
});
while (page.hasNextPage()) {
    page = page.getNextPage();
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

**request:** `SeedPagination.SearchRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `Complex.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## InlineUsers InlineUsers
<details><summary><code>client.inlineUsers.inlineUsers.<a href="/src/api/resources/inlineUsers/resources/inlineUsers/client/Client.ts">listWithCursorPagination</a>({ ...params }) -> core.Page<SeedPagination.ListUsersPaginationResponse.Data.Users.Item, SeedPagination.ListUsersPaginationResponse></code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
const response = await client.inlineUsers.inlineUsers.listWithCursorPagination({
    page: 1,
    per_page: 1,
    order: "asc",
    starting_after: "starting_after"
});
for await (const item of response) {
    console.log(item);
}

// Or you can manually iterate page-by-page
let page = await client.inlineUsers.inlineUsers.listWithCursorPagination({
    page: 1,
    per_page: 1,
    order: "asc",
    starting_after: "starting_after"
});
while (page.hasNextPage()) {
    page = page.getNextPage();
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

**request:** `SeedPagination.inlineUsers.ListUsersCursorPaginationRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `InlineUsers.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.inlineUsers.inlineUsers.<a href="/src/api/resources/inlineUsers/resources/inlineUsers/client/Client.ts">listWithMixedTypeCursorPagination</a>({ ...params }) -> core.Page<SeedPagination.ListUsersMixedTypePaginationResponse.Data.Users.Item, SeedPagination.ListUsersMixedTypePaginationResponse></code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
const response = await client.inlineUsers.inlineUsers.listWithMixedTypeCursorPagination({
    cursor: "cursor"
});
for await (const item of response) {
    console.log(item);
}

// Or you can manually iterate page-by-page
let page = await client.inlineUsers.inlineUsers.listWithMixedTypeCursorPagination({
    cursor: "cursor"
});
while (page.hasNextPage()) {
    page = page.getNextPage();
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

**request:** `SeedPagination.inlineUsers.ListUsersMixedTypeCursorPaginationRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `InlineUsers.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.inlineUsers.inlineUsers.<a href="/src/api/resources/inlineUsers/resources/inlineUsers/client/Client.ts">listWithBodyCursorPagination</a>({ ...params }) -> core.Page<SeedPagination.ListUsersPaginationResponse.Data.Users.Item, SeedPagination.ListUsersPaginationResponse></code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
const response = await client.inlineUsers.inlineUsers.listWithBodyCursorPagination({
    pagination: {
        cursor: "cursor"
    }
});
for await (const item of response) {
    console.log(item);
}

// Or you can manually iterate page-by-page
let page = await client.inlineUsers.inlineUsers.listWithBodyCursorPagination({
    pagination: {
        cursor: "cursor"
    }
});
while (page.hasNextPage()) {
    page = page.getNextPage();
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

**request:** `SeedPagination.inlineUsers.ListUsersBodyCursorPaginationRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `InlineUsers.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.inlineUsers.inlineUsers.<a href="/src/api/resources/inlineUsers/resources/inlineUsers/client/Client.ts">listWithOffsetPagination</a>({ ...params }) -> core.Page<SeedPagination.ListUsersPaginationResponse.Data.Users.Item, SeedPagination.ListUsersPaginationResponse></code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
const response = await client.inlineUsers.inlineUsers.listWithOffsetPagination({
    page: 1,
    per_page: 1,
    order: "asc",
    starting_after: "starting_after"
});
for await (const item of response) {
    console.log(item);
}

// Or you can manually iterate page-by-page
let page = await client.inlineUsers.inlineUsers.listWithOffsetPagination({
    page: 1,
    per_page: 1,
    order: "asc",
    starting_after: "starting_after"
});
while (page.hasNextPage()) {
    page = page.getNextPage();
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

**request:** `SeedPagination.inlineUsers.ListUsersOffsetPaginationRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `InlineUsers.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.inlineUsers.inlineUsers.<a href="/src/api/resources/inlineUsers/resources/inlineUsers/client/Client.ts">listWithDoubleOffsetPagination</a>({ ...params }) -> core.Page<SeedPagination.ListUsersPaginationResponse.Data.Users.Item, SeedPagination.ListUsersPaginationResponse></code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
const response = await client.inlineUsers.inlineUsers.listWithDoubleOffsetPagination({
    page: 1.1,
    per_page: 1.1,
    order: "asc",
    starting_after: "starting_after"
});
for await (const item of response) {
    console.log(item);
}

// Or you can manually iterate page-by-page
let page = await client.inlineUsers.inlineUsers.listWithDoubleOffsetPagination({
    page: 1.1,
    per_page: 1.1,
    order: "asc",
    starting_after: "starting_after"
});
while (page.hasNextPage()) {
    page = page.getNextPage();
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

**request:** `SeedPagination.inlineUsers.ListUsersDoubleOffsetPaginationRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `InlineUsers.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.inlineUsers.inlineUsers.<a href="/src/api/resources/inlineUsers/resources/inlineUsers/client/Client.ts">listWithBodyOffsetPagination</a>({ ...params }) -> core.Page<SeedPagination.ListUsersPaginationResponse.Data.Users.Item, SeedPagination.ListUsersPaginationResponse></code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
const response = await client.inlineUsers.inlineUsers.listWithBodyOffsetPagination({
    pagination: {
        page: 1
    }
});
for await (const item of response) {
    console.log(item);
}

// Or you can manually iterate page-by-page
let page = await client.inlineUsers.inlineUsers.listWithBodyOffsetPagination({
    pagination: {
        page: 1
    }
});
while (page.hasNextPage()) {
    page = page.getNextPage();
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

**request:** `SeedPagination.inlineUsers.ListUsersBodyOffsetPaginationRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `InlineUsers.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.inlineUsers.inlineUsers.<a href="/src/api/resources/inlineUsers/resources/inlineUsers/client/Client.ts">listWithOffsetStepPagination</a>({ ...params }) -> core.Page<SeedPagination.ListUsersPaginationResponse.Data.Users.Item, SeedPagination.ListUsersPaginationResponse></code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
const response = await client.inlineUsers.inlineUsers.listWithOffsetStepPagination({
    page: 1,
    limit: 1,
    order: "asc"
});
for await (const item of response) {
    console.log(item);
}

// Or you can manually iterate page-by-page
let page = await client.inlineUsers.inlineUsers.listWithOffsetStepPagination({
    page: 1,
    limit: 1,
    order: "asc"
});
while (page.hasNextPage()) {
    page = page.getNextPage();
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

**request:** `SeedPagination.inlineUsers.ListUsersOffsetStepPaginationRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `InlineUsers.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.inlineUsers.inlineUsers.<a href="/src/api/resources/inlineUsers/resources/inlineUsers/client/Client.ts">listWithOffsetPaginationHasNextPage</a>({ ...params }) -> core.Page<SeedPagination.ListUsersPaginationResponse.Data.Users.Item, SeedPagination.ListUsersPaginationResponse></code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
const response = await client.inlineUsers.inlineUsers.listWithOffsetPaginationHasNextPage({
    page: 1,
    limit: 1,
    order: "asc"
});
for await (const item of response) {
    console.log(item);
}

// Or you can manually iterate page-by-page
let page = await client.inlineUsers.inlineUsers.listWithOffsetPaginationHasNextPage({
    page: 1,
    limit: 1,
    order: "asc"
});
while (page.hasNextPage()) {
    page = page.getNextPage();
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

**request:** `SeedPagination.inlineUsers.ListWithOffsetPaginationHasNextPageRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `InlineUsers.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.inlineUsers.inlineUsers.<a href="/src/api/resources/inlineUsers/resources/inlineUsers/client/Client.ts">listWithExtendedResults</a>({ ...params }) -> core.Page<SeedPagination.UserListContainer.Users.Item, SeedPagination.ListUsersExtendedResponse></code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
const response = await client.inlineUsers.inlineUsers.listWithExtendedResults({
    cursor: "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32"
});
for await (const item of response) {
    console.log(item);
}

// Or you can manually iterate page-by-page
let page = await client.inlineUsers.inlineUsers.listWithExtendedResults({
    cursor: "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32"
});
while (page.hasNextPage()) {
    page = page.getNextPage();
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

**request:** `SeedPagination.inlineUsers.ListUsersExtendedRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `InlineUsers.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.inlineUsers.inlineUsers.<a href="/src/api/resources/inlineUsers/resources/inlineUsers/client/Client.ts">listWithExtendedResultsAndOptionalData</a>({ ...params }) -> core.Page<SeedPagination.UserOptionalListContainer.Users.Item, SeedPagination.ListUsersExtendedOptionalListResponse></code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
const response = await client.inlineUsers.inlineUsers.listWithExtendedResultsAndOptionalData({
    cursor: "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32"
});
for await (const item of response) {
    console.log(item);
}

// Or you can manually iterate page-by-page
let page = await client.inlineUsers.inlineUsers.listWithExtendedResultsAndOptionalData({
    cursor: "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32"
});
while (page.hasNextPage()) {
    page = page.getNextPage();
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

**request:** `SeedPagination.inlineUsers.ListUsersExtendedRequestForOptionalData` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `InlineUsers.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.inlineUsers.inlineUsers.<a href="/src/api/resources/inlineUsers/resources/inlineUsers/client/Client.ts">listUsernames</a>({ ...params }) -> core.Page<string, SeedPagination.UsernameCursor></code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
const response = await client.inlineUsers.inlineUsers.listUsernames({
    starting_after: "starting_after"
});
for await (const item of response) {
    console.log(item);
}

// Or you can manually iterate page-by-page
let page = await client.inlineUsers.inlineUsers.listUsernames({
    starting_after: "starting_after"
});
while (page.hasNextPage()) {
    page = page.getNextPage();
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

**request:** `SeedPagination.inlineUsers.ListUsernamesRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `InlineUsers.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.inlineUsers.inlineUsers.<a href="/src/api/resources/inlineUsers/resources/inlineUsers/client/Client.ts">listWithGlobalConfig</a>({ ...params }) -> core.Page<string, SeedPagination.UsernameContainer></code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
const response = await client.inlineUsers.inlineUsers.listWithGlobalConfig({
    offset: 1
});
for await (const item of response) {
    console.log(item);
}

// Or you can manually iterate page-by-page
let page = await client.inlineUsers.inlineUsers.listWithGlobalConfig({
    offset: 1
});
while (page.hasNextPage()) {
    page = page.getNextPage();
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

**request:** `SeedPagination.inlineUsers.ListWithGlobalConfigRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `InlineUsers.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## Users
<details><summary><code>client.users.<a href="/src/api/resources/users/client/Client.ts">listWithCursorPagination</a>({ ...params }) -> core.Page<SeedPagination.User, SeedPagination.ListUsersPaginationResponse></code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
const response = await client.users.listWithCursorPagination({
    page: 1,
    per_page: 1,
    order: "asc",
    starting_after: "starting_after"
});
for await (const item of response) {
    console.log(item);
}

// Or you can manually iterate page-by-page
let page = await client.users.listWithCursorPagination({
    page: 1,
    per_page: 1,
    order: "asc",
    starting_after: "starting_after"
});
while (page.hasNextPage()) {
    page = page.getNextPage();
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

**request:** `SeedPagination.ListUsersCursorPaginationRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `Users.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.users.<a href="/src/api/resources/users/client/Client.ts">listWithMixedTypeCursorPagination</a>({ ...params }) -> core.Page<SeedPagination.User, SeedPagination.ListUsersMixedTypePaginationResponse></code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
const response = await client.users.listWithMixedTypeCursorPagination({
    cursor: "cursor"
});
for await (const item of response) {
    console.log(item);
}

// Or you can manually iterate page-by-page
let page = await client.users.listWithMixedTypeCursorPagination({
    cursor: "cursor"
});
while (page.hasNextPage()) {
    page = page.getNextPage();
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

**request:** `SeedPagination.ListUsersMixedTypeCursorPaginationRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `Users.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.users.<a href="/src/api/resources/users/client/Client.ts">listWithBodyCursorPagination</a>({ ...params }) -> core.Page<SeedPagination.User, SeedPagination.ListUsersPaginationResponse></code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
const response = await client.users.listWithBodyCursorPagination({
    pagination: {
        cursor: "cursor"
    }
});
for await (const item of response) {
    console.log(item);
}

// Or you can manually iterate page-by-page
let page = await client.users.listWithBodyCursorPagination({
    pagination: {
        cursor: "cursor"
    }
});
while (page.hasNextPage()) {
    page = page.getNextPage();
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

**request:** `SeedPagination.ListUsersBodyCursorPaginationRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `Users.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.users.<a href="/src/api/resources/users/client/Client.ts">listWithOffsetPagination</a>({ ...params }) -> core.Page<SeedPagination.User, SeedPagination.ListUsersPaginationResponse></code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
const response = await client.users.listWithOffsetPagination({
    page: 1,
    per_page: 1,
    order: "asc",
    starting_after: "starting_after"
});
for await (const item of response) {
    console.log(item);
}

// Or you can manually iterate page-by-page
let page = await client.users.listWithOffsetPagination({
    page: 1,
    per_page: 1,
    order: "asc",
    starting_after: "starting_after"
});
while (page.hasNextPage()) {
    page = page.getNextPage();
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

**request:** `SeedPagination.ListUsersOffsetPaginationRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `Users.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.users.<a href="/src/api/resources/users/client/Client.ts">listWithDoubleOffsetPagination</a>({ ...params }) -> core.Page<SeedPagination.User, SeedPagination.ListUsersPaginationResponse></code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
const response = await client.users.listWithDoubleOffsetPagination({
    page: 1.1,
    per_page: 1.1,
    order: "asc",
    starting_after: "starting_after"
});
for await (const item of response) {
    console.log(item);
}

// Or you can manually iterate page-by-page
let page = await client.users.listWithDoubleOffsetPagination({
    page: 1.1,
    per_page: 1.1,
    order: "asc",
    starting_after: "starting_after"
});
while (page.hasNextPage()) {
    page = page.getNextPage();
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

**request:** `SeedPagination.ListUsersDoubleOffsetPaginationRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `Users.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.users.<a href="/src/api/resources/users/client/Client.ts">listWithBodyOffsetPagination</a>({ ...params }) -> core.Page<SeedPagination.User, SeedPagination.ListUsersPaginationResponse></code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
const response = await client.users.listWithBodyOffsetPagination({
    pagination: {
        page: 1
    }
});
for await (const item of response) {
    console.log(item);
}

// Or you can manually iterate page-by-page
let page = await client.users.listWithBodyOffsetPagination({
    pagination: {
        page: 1
    }
});
while (page.hasNextPage()) {
    page = page.getNextPage();
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

**request:** `SeedPagination.ListUsersBodyOffsetPaginationRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `Users.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.users.<a href="/src/api/resources/users/client/Client.ts">listWithOffsetStepPagination</a>({ ...params }) -> core.Page<SeedPagination.User, SeedPagination.ListUsersPaginationResponse></code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
const response = await client.users.listWithOffsetStepPagination({
    page: 1,
    limit: 1,
    order: "asc"
});
for await (const item of response) {
    console.log(item);
}

// Or you can manually iterate page-by-page
let page = await client.users.listWithOffsetStepPagination({
    page: 1,
    limit: 1,
    order: "asc"
});
while (page.hasNextPage()) {
    page = page.getNextPage();
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

**request:** `SeedPagination.ListUsersOffsetStepPaginationRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `Users.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.users.<a href="/src/api/resources/users/client/Client.ts">listWithOffsetPaginationHasNextPage</a>({ ...params }) -> core.Page<SeedPagination.User, SeedPagination.ListUsersPaginationResponse></code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
const response = await client.users.listWithOffsetPaginationHasNextPage({
    page: 1,
    limit: 1,
    order: "asc"
});
for await (const item of response) {
    console.log(item);
}

// Or you can manually iterate page-by-page
let page = await client.users.listWithOffsetPaginationHasNextPage({
    page: 1,
    limit: 1,
    order: "asc"
});
while (page.hasNextPage()) {
    page = page.getNextPage();
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

**request:** `SeedPagination.ListWithOffsetPaginationHasNextPageRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `Users.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.users.<a href="/src/api/resources/users/client/Client.ts">listWithExtendedResults</a>({ ...params }) -> core.Page<SeedPagination.User, SeedPagination.ListUsersExtendedResponse></code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
const response = await client.users.listWithExtendedResults({
    cursor: "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32"
});
for await (const item of response) {
    console.log(item);
}

// Or you can manually iterate page-by-page
let page = await client.users.listWithExtendedResults({
    cursor: "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32"
});
while (page.hasNextPage()) {
    page = page.getNextPage();
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

**request:** `SeedPagination.ListUsersExtendedRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `Users.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.users.<a href="/src/api/resources/users/client/Client.ts">listWithExtendedResultsAndOptionalData</a>({ ...params }) -> core.Page<SeedPagination.User, SeedPagination.ListUsersExtendedOptionalListResponse></code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
const response = await client.users.listWithExtendedResultsAndOptionalData({
    cursor: "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32"
});
for await (const item of response) {
    console.log(item);
}

// Or you can manually iterate page-by-page
let page = await client.users.listWithExtendedResultsAndOptionalData({
    cursor: "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32"
});
while (page.hasNextPage()) {
    page = page.getNextPage();
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

**request:** `SeedPagination.ListUsersExtendedRequestForOptionalData` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `Users.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.users.<a href="/src/api/resources/users/client/Client.ts">listUsernames</a>({ ...params }) -> core.Page<string, SeedPagination.UsernameCursor></code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
const response = await client.users.listUsernames({
    starting_after: "starting_after"
});
for await (const item of response) {
    console.log(item);
}

// Or you can manually iterate page-by-page
let page = await client.users.listUsernames({
    starting_after: "starting_after"
});
while (page.hasNextPage()) {
    page = page.getNextPage();
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

**request:** `SeedPagination.ListUsernamesRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `Users.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.users.<a href="/src/api/resources/users/client/Client.ts">listWithGlobalConfig</a>({ ...params }) -> core.Page<string, SeedPagination.UsernameContainer></code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
const response = await client.users.listWithGlobalConfig({
    offset: 1
});
for await (const item of response) {
    console.log(item);
}

// Or you can manually iterate page-by-page
let page = await client.users.listWithGlobalConfig({
    offset: 1
});
while (page.hasNextPage()) {
    page = page.getNextPage();
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

**request:** `SeedPagination.ListWithGlobalConfigRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `Users.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>
