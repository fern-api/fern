# Reference
## Users
<details><summary><code>client.users.<a href="/src/api/resources/users/client/Client.ts">listWithUriPagination</a>({ ...params }) -> core.Page&lt;SeedTsPaginationUriPathParams.User, SeedTsPaginationUriPathParams.ListUsersUriPaginationResponse&gt;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
const pageableResponse = await client.users.listWithUriPagination({
    "X-Api-Version": "X-Api-Version",
    accountId: "accountId",
    pageSize: 1
});
for await (const item of pageableResponse) {
    console.log(item);
}

// Or you can manually iterate page-by-page
let page = await client.users.listWithUriPagination({
    "X-Api-Version": "X-Api-Version",
    accountId: "accountId",
    pageSize: 1
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

**request:** `SeedTsPaginationUriPathParams.ListWithUriPaginationRequest` 
    
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

<details><summary><code>client.users.<a href="/src/api/resources/users/client/Client.ts">listWithPathPagination</a>({ ...params }) -> core.Page&lt;SeedTsPaginationUriPathParams.User, SeedTsPaginationUriPathParams.ListUsersPathPaginationResponse&gt;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
const pageableResponse = await client.users.listWithPathPagination({
    accountId: "accountId",
    pageSize: 1
});
for await (const item of pageableResponse) {
    console.log(item);
}

// Or you can manually iterate page-by-page
let page = await client.users.listWithPathPagination({
    accountId: "accountId",
    pageSize: 1
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

**request:** `SeedTsPaginationUriPathParams.ListWithPathPaginationRequest` 
    
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

