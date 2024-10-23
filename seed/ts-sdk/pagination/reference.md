# Reference

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
const response = await client.users.listWithCursorPagination();
for await (const item of response) {
    console.log(item);
}

// Or you can manually iterate page-by-page
const page = await client.users.listWithCursorPagination();
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
    pagination: undefined,
});
for await (const item of response) {
    console.log(item);
}

// Or you can manually iterate page-by-page
const page = await client.users.listWithBodyCursorPagination({
    pagination: undefined,
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
const response = await client.users.listWithOffsetPagination();
for await (const item of response) {
    console.log(item);
}

// Or you can manually iterate page-by-page
const page = await client.users.listWithOffsetPagination();
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
    pagination: undefined,
});
for await (const item of response) {
    console.log(item);
}

// Or you can manually iterate page-by-page
const page = await client.users.listWithBodyOffsetPagination({
    pagination: undefined,
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
const response = await client.users.listWithOffsetStepPagination();
for await (const item of response) {
    console.log(item);
}

// Or you can manually iterate page-by-page
const page = await client.users.listWithOffsetStepPagination();
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
const response = await client.users.listWithOffsetPaginationHasNextPage();
for await (const item of response) {
    console.log(item);
}

// Or you can manually iterate page-by-page
const page = await client.users.listWithOffsetPaginationHasNextPage();
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
const response = await client.users.listWithExtendedResults();
for await (const item of response) {
    console.log(item);
}

// Or you can manually iterate page-by-page
const page = await client.users.listWithExtendedResults();
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
const response = await client.users.listWithExtendedResultsAndOptionalData();
for await (const item of response) {
    console.log(item);
}

// Or you can manually iterate page-by-page
const page = await client.users.listWithExtendedResultsAndOptionalData();
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
const response = await client.users.listUsernames();
for await (const item of response) {
    console.log(item);
}

// Or you can manually iterate page-by-page
const page = await client.users.listUsernames();
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

<details><summary><code>client.users.<a href="/src/api/resources/users/client/Client.ts">listWithGlobalConfig</a>({ ...params }) -> core.Page<string></code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
const response = await client.users.listWithGlobalConfig();
for await (const item of response) {
    console.log(item);
}

// Or you can manually iterate page-by-page
const page = await client.users.listWithGlobalConfig();
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
