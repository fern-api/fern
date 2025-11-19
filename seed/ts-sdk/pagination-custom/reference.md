# Reference
## users
<details><summary><code>client.users.<a href="/src/api/resources/users/client/Client.ts">listUsernamesCustom</a>({ ...params }) -> SeedPagination.UsernameCursor</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
const pageableResponse = await client.users.listUsernamesCustom({
    starting_after: "starting_after"
});
for await (const item of pageableResponse) {
    console.log(item);
}

// Or you can manually iterate page-by-page
let page = await client.users.listUsernamesCustom({
    starting_after: "starting_after"
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

**request:** `SeedPagination.ListUsernamesRequestCustom` 
    
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
