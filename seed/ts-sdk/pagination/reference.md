# Reference

## Conversations

<details><summary><code>client.complex.<a href="/src/api/resources/complex/client/Client.ts">search</a>({ ...params }) -> core.Page<SeedPagination.Conversation></code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
const response = await client.complex.search({
    pagination: {
        perPage: 1,
        startingAfter: "starting_after",
    },
    query: {
        field: "field",
        operator: "=",
        value: "value",
    },
});
for await (const item of response) {
    console.log(item);
}

// Or you can manually iterate page-by-page
const page = await client.complex.search({
    pagination: {
        perPage: 1,
        startingAfter: "starting_after",
    },
    query: {
        field: "field",
        operator: "=",
        value: "value",
    },
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

## Users

<details><summary><code>client.users.<a href="/src/api/resources/users/client/Client.ts">listWithCursorPagination</a>({ ...params }) -> core.Page<SeedPagination.User></code></summary>
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
    perPage: 1,
    order: "asc",
    startingAfter: "starting_after",
});
for await (const item of response) {
    console.log(item);
}

// Or you can manually iterate page-by-page
const page = await client.users.listWithCursorPagination({
    page: 1,
    perPage: 1,
    order: "asc",
    startingAfter: "starting_after",
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

<details><summary><code>client.users.<a href="/src/api/resources/users/client/Client.ts">listWithMixedTypeCursorPagination</a>({ ...params }) -> core.Page<SeedPagination.User></code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
const response = await client.users.listWithMixedTypeCursorPagination({
    cursor: "cursor",
});
for await (const item of response) {
    console.log(item);
}

// Or you can manually iterate page-by-page
const page = await client.users.listWithMixedTypeCursorPagination({
    cursor: "cursor",
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

<details><summary><code>client.users.<a href="/src/api/resources/users/client/Client.ts">listWithBodyCursorPagination</a>({ ...params }) -> core.Page<SeedPagination.User></code></summary>
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
        cursor: "cursor",
    },
});
for await (const item of response) {
    console.log(item);
}

// Or you can manually iterate page-by-page
const page = await client.users.listWithBodyCursorPagination({
    pagination: {
        cursor: "cursor",
    },
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

<details><summary><code>client.users.<a href="/src/api/resources/users/client/Client.ts">listWithOffsetPagination</a>({ ...params }) -> core.Page<SeedPagination.User></code></summary>
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
    perPage: 1,
    order: "asc",
    startingAfter: "starting_after",
});
for await (const item of response) {
    console.log(item);
}

// Or you can manually iterate page-by-page
const page = await client.users.listWithOffsetPagination({
    page: 1,
    perPage: 1,
    order: "asc",
    startingAfter: "starting_after",
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

<details><summary><code>client.users.<a href="/src/api/resources/users/client/Client.ts">listWithDoubleOffsetPagination</a>({ ...params }) -> core.Page<SeedPagination.User></code></summary>
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
    perPage: 1.1,
    order: "asc",
    startingAfter: "starting_after",
});
for await (const item of response) {
    console.log(item);
}

// Or you can manually iterate page-by-page
const page = await client.users.listWithDoubleOffsetPagination({
    page: 1.1,
    perPage: 1.1,
    order: "asc",
    startingAfter: "starting_after",
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

<details><summary><code>client.users.<a href="/src/api/resources/users/client/Client.ts">listWithBodyOffsetPagination</a>({ ...params }) -> core.Page<SeedPagination.User></code></summary>
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
        page: 1,
    },
});
for await (const item of response) {
    console.log(item);
}

// Or you can manually iterate page-by-page
const page = await client.users.listWithBodyOffsetPagination({
    pagination: {
        page: 1,
    },
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

<details><summary><code>client.users.<a href="/src/api/resources/users/client/Client.ts">listWithOffsetStepPagination</a>({ ...params }) -> core.Page<SeedPagination.User></code></summary>
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
    order: "asc",
});
for await (const item of response) {
    console.log(item);
}

// Or you can manually iterate page-by-page
const page = await client.users.listWithOffsetStepPagination({
    page: 1,
    limit: 1,
    order: "asc",
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

<details><summary><code>client.users.<a href="/src/api/resources/users/client/Client.ts">listWithOffsetPaginationHasNextPage</a>({ ...params }) -> core.Page<SeedPagination.User></code></summary>
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
    order: "asc",
});
for await (const item of response) {
    console.log(item);
}

// Or you can manually iterate page-by-page
const page = await client.users.listWithOffsetPaginationHasNextPage({
    page: 1,
    limit: 1,
    order: "asc",
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

<details><summary><code>client.users.<a href="/src/api/resources/users/client/Client.ts">listWithExtendedResults</a>({ ...params }) -> core.Page<SeedPagination.User></code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
const response = await client.users.listWithExtendedResults({
    cursor: "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32",
});
for await (const item of response) {
    console.log(item);
}

// Or you can manually iterate page-by-page
const page = await client.users.listWithExtendedResults({
    cursor: "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32",
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

<details><summary><code>client.users.<a href="/src/api/resources/users/client/Client.ts">listWithExtendedResultsAndOptionalData</a>({ ...params }) -> core.Page<SeedPagination.User></code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
const response = await client.users.listWithExtendedResultsAndOptionalData({
    cursor: "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32",
});
for await (const item of response) {
    console.log(item);
}

// Or you can manually iterate page-by-page
const page = await client.users.listWithExtendedResultsAndOptionalData({
    cursor: "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32",
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

<details><summary><code>client.users.<a href="/src/api/resources/users/client/Client.ts">listUsernames</a>({ ...params }) -> core.Page<string></code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
const response = await client.users.listUsernames({
    startingAfter: "starting_after",
});
for await (const item of response) {
    console.log(item);
}

// Or you can manually iterate page-by-page
const page = await client.users.listUsernames({
    startingAfter: "starting_after",
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

<details><summary><code>client.users.<a href="/src/api/resources/users/client/Client.ts">listUsernamesCustom</a>({ ...params }) -> SeedPagination.UsernameCursor</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.users.listUsernamesCustom({
    startingAfter: "starting_after",
});
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

<details><summary><code>client.users.<a href="/src/api/resources/users/client/Client.ts">listWithGlobalConfig</a>({ ...params }) -> core.Page<string></code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
const response = await client.users.listWithGlobalConfig({
    offset: 1,
});
for await (const item of response) {
    console.log(item);
}

// Or you can manually iterate page-by-page
const page = await client.users.listWithGlobalConfig({
    offset: 1,
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
