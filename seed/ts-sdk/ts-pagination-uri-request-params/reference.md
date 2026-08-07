# Reference
## Users
<details><summary><code>client.users.<a href="/src/api/resources/users/client/Client.ts">listWithUriPagination</a>(account_id, { ...params }) -> core.Page&lt;SeedTsPaginationUriRequestParams.User, SeedTsPaginationUriRequestParams.ListUsersResponse&gt;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
const pageableResponse = await client.users.listWithUriPagination("acct_1", {
    filter: "name",
    page_size: 2
});
for await (const item of pageableResponse) {
    console.log(item);
}

// Or you can manually iterate page-by-page
let page = await client.users.listWithUriPagination("acct_1", {
    filter: "name",
    page_size: 2
});
while (page.hasNextPage()) {
    page = page.getNextPage();
}

// You can also access the underlying response
const response = page.response;

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

**account_id:** `string` 
    
</dd>
</dl>

<dl>
<dd>

**request:** `SeedTsPaginationUriRequestParams.ListUsersUriPaginationRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `UsersClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.users.<a href="/src/api/resources/users/client/Client.ts">listWithPathPagination</a>(account_id, { ...params }) -> core.Page&lt;SeedTsPaginationUriRequestParams.User, SeedTsPaginationUriRequestParams.ListUsersResponse&gt;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
const pageableResponse = await client.users.listWithPathPagination("acct_1", {
    filter: "name",
    page_size: 2
});
for await (const item of pageableResponse) {
    console.log(item);
}

// Or you can manually iterate page-by-page
let page = await client.users.listWithPathPagination("acct_1", {
    filter: "name",
    page_size: 2
});
while (page.hasNextPage()) {
    page = page.getNextPage();
}

// You can also access the underlying response
const response = page.response;

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

**account_id:** `string` 
    
</dd>
</dl>

<dl>
<dd>

**request:** `SeedTsPaginationUriRequestParams.ListUsersPathPaginationRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `UsersClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.users.<a href="/src/api/resources/users/client/Client.ts">searchWithUriPagination</a>(account_id, { ...params }) -> core.Page&lt;SeedTsPaginationUriRequestParams.User, SeedTsPaginationUriRequestParams.ListUsersResponse&gt;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
const pageableResponse = await client.users.searchWithUriPagination("acct_1", {
    query: "alice"
});
for await (const item of pageableResponse) {
    console.log(item);
}

// Or you can manually iterate page-by-page
let page = await client.users.searchWithUriPagination("acct_1", {
    query: "alice"
});
while (page.hasNextPage()) {
    page = page.getNextPage();
}

// You can also access the underlying response
const response = page.response;

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

**account_id:** `string` 
    
</dd>
</dl>

<dl>
<dd>

**request:** `SeedTsPaginationUriRequestParams.SearchUsersRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `UsersClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

