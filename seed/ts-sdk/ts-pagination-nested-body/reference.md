# Reference
## Users
<details><summary><code>client.users.<a href="/src/api/resources/users/client/Client.ts">listWithNestedOffset</a>({ ...params }) -> core.Page&lt;SeedTsPaginationNestedBody.User, SeedTsPaginationNestedBody.ListUsersResponse&gt;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
const pageableResponse = await client.users.listWithNestedOffset({
    filter: "active"
});
for await (const item of pageableResponse) {
    console.log(item);
}

// Or you can manually iterate page-by-page
let page = await client.users.listWithNestedOffset({
    filter: "active"
});
while (page.hasNextPage()) {
    page = await page.getNextPage();
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

**request:** `SeedTsPaginationNestedBody.ListUsersNestedOffsetRequest` 
    
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

<details><summary><code>client.users.<a href="/src/api/resources/users/client/Client.ts">listWithNestedOffsetAndStep</a>({ ...params }) -> core.Page&lt;SeedTsPaginationNestedBody.User, SeedTsPaginationNestedBody.ListUsersResponse&gt;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
const pageableResponse = await client.users.listWithNestedOffsetAndStep({
    filter: "active",
    options: {
        offset: 0,
        count: 2
    }
});
for await (const item of pageableResponse) {
    console.log(item);
}

// Or you can manually iterate page-by-page
let page = await client.users.listWithNestedOffsetAndStep({
    filter: "active",
    options: {
        offset: 0,
        count: 2
    }
});
while (page.hasNextPage()) {
    page = await page.getNextPage();
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

**request:** `SeedTsPaginationNestedBody.ListUsersNestedOffsetStepRequest` 
    
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

<details><summary><code>client.users.<a href="/src/api/resources/users/client/Client.ts">listWithNestedCursor</a>({ ...params }) -> core.Page&lt;SeedTsPaginationNestedBody.User, SeedTsPaginationNestedBody.ListUsersCursorResponse&gt;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
const pageableResponse = await client.users.listWithNestedCursor({
    filter: "active"
});
for await (const item of pageableResponse) {
    console.log(item);
}

// Or you can manually iterate page-by-page
let page = await client.users.listWithNestedCursor({
    filter: "active"
});
while (page.hasNextPage()) {
    page = await page.getNextPage();
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

**request:** `SeedTsPaginationNestedBody.ListUsersNestedCursorRequest` 
    
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

<details><summary><code>client.users.<a href="/src/api/resources/users/client/Client.ts">listWithDeeplyNestedCursor</a>({ ...params }) -> core.Page&lt;SeedTsPaginationNestedBody.User, SeedTsPaginationNestedBody.ListUsersCursorResponse&gt;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
const pageableResponse = await client.users.listWithDeeplyNestedCursor({
    filter: "active"
});
for await (const item of pageableResponse) {
    console.log(item);
}

// Or you can manually iterate page-by-page
let page = await client.users.listWithDeeplyNestedCursor({
    filter: "active"
});
while (page.hasNextPage()) {
    page = await page.getNextPage();
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

**request:** `SeedTsPaginationNestedBody.ListUsersDeeplyNestedCursorRequest` 
    
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

