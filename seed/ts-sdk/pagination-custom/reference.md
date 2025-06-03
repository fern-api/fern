# Reference

## Users

<details><summary><code>client.users.<a href="/src/api/resources/users/client/Client.ts">listUsernamesCustom</a>({ ...params }) -> SeedPagination.UsernameCursor</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
const response = await client.users.listUsernamesCustom({
    starting_after: "starting_after",
});
for await (const item of response) {
    console.log(item);
}

// Or you can manually iterate page-by-page
const page = await client.users.listUsernamesCustom({
    starting_after: "starting_after",
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

**request:** `SeedPagination.ListUsernamesRequestCustom`

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
