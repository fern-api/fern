# Reference
## Query
<details><summary><code>client.query.<a href="/src/api/resources/query/client/Client.ts">viewer</a>(selection) -> core.GraphqlResponse&lt;core.Result&lt;SeedApi.User, S&gt; | undefined&gt;</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

The currently authenticated user (no arguments — exercises the no-arg selection-only call shape).
</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.query.viewer();

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

**selection:** `S` — GraphQL field selection — choose which fields to return. Defaults to all scalar fields.
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `QueryClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.query.<a href="/src/api/resources/query/client/Client.ts">user</a>({ ...params }, selection) -> core.GraphqlResponse&lt;core.Result&lt;SeedApi.User, S&gt; | undefined&gt;</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Fetch a single user by id.
</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.query.user({
    id: "id"
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

**request:** `SeedApi.UserRequest` 
    
</dd>
</dl>

<dl>
<dd>

**selection:** `S` — GraphQL field selection — choose which fields to return. Defaults to all scalar fields.
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `QueryClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.query.<a href="/src/api/resources/query/client/Client.ts">search</a>({ ...params }, selection) -> core.GraphqlResponse&lt;core.Result&lt;SeedApi.SearchResult[], S&gt;&gt;</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Search across users and posts (union → inline fragments).
</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.query.search({
    query: "query"
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

**request:** `SeedApi.SearchRequest` 
    
</dd>
</dl>

<dl>
<dd>

**selection:** `S` — GraphQL field selection — choose which fields to return. Defaults to all scalar fields.
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `QueryClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.query.<a href="/src/api/resources/query/client/Client.ts">feed</a>({ ...params }, selection) -> core.GraphqlResponse&lt;core.Result&lt;SeedApi.PostConnection, S&gt;&gt;</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

A paginated feed of posts.
</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.query.feed({
    first: 1,
    after: "after"
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

**request:** `SeedApi.FeedRequest` 
    
</dd>
</dl>

<dl>
<dd>

**selection:** `S` — GraphQL field selection — choose which fields to return. Defaults to all scalar fields.
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `QueryClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## Mutation
<details><summary><code>client.mutation.<a href="/src/api/resources/mutation/client/Client.ts">createPost</a>({ ...params }, selection) -> core.GraphqlResponse&lt;core.Result&lt;SeedApi.Post, S&gt;&gt;</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Create a post (input object argument → GraphQL variable).
</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.mutation.createPost({
    input: {
        title: "title",
        body: "body",
        tags: ["tags", "tags"]
    }
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

**request:** `SeedApi.CreatePostRequest` 
    
</dd>
</dl>

<dl>
<dd>

**selection:** `S` — GraphQL field selection — choose which fields to return. Defaults to all scalar fields.
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `MutationClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## Subscription
<details><summary><code>client.subscription.<a href="/src/api/resources/subscription/client/Client.ts">postAdded</a>({ ...params }, selection) -> AsyncIterableIterator&lt;core.Result&lt;SeedApi.Post, S&gt;&gt;</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Stream posts as they are added to a channel.
</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
for await (const event of client.subscription.postAdded({
    channelId: "channelId"
})) {
    console.log(event);
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

**request:** `SeedApi.PostAddedRequest` 
    
</dd>
</dl>

<dl>
<dd>

**selection:** `S` — GraphQL field selection — choose which fields to return. Defaults to all scalar fields.
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `SubscriptionClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

