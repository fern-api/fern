# Reference
## Headers
<details><summary><code>client.headers.<a href="/src/api/resources/headers/client/Client.ts">send</a>({ ...params }) -> SeedApi.SendResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.headers.send({
    "X-Endpoint-Version": "02-12-2024",
    "X-Async": true,
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

**request:** `SeedApi.HeadersSendRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `HeadersClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## Inlined
<details><summary><code>client.inlined.<a href="/src/api/resources/inlined/client/Client.ts">send</a>({ ...params }) -> SeedApi.SendResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.inlined.send({
    prompt: "You are a helpful assistant",
    query: "query",
    stream: true,
    aliasedContext: "You're super wise",
    objectWithLiteral: {
        nestedLiteral: {
            myLiteral: "How super cool"
        }
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

**request:** `SeedApi.InlinedSendRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `InlinedClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## Path
<details><summary><code>client.path.<a href="/src/api/resources/path/client/Client.ts">send</a>({ ...params }) -> SeedApi.SendResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.path.send({
    id: "123"
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

**request:** `SeedApi.PathSendRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `PathClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## Query
<details><summary><code>client.query.<a href="/src/api/resources/query/client/Client.ts">send</a>({ ...params }) -> SeedApi.SendResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.query.send({
    prompt: "You are a helpful assistant",
    alias_prompt: "You are a helpful assistant",
    query: "query",
    stream: true,
    alias_stream: true
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

**request:** `SeedApi.QuerySendRequest` 
    
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

## Reference
<details><summary><code>client.reference.<a href="/src/api/resources/reference/client/Client.ts">send</a>({ ...params }) -> SeedApi.SendResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.reference.send({
    prompt: "You are a helpful assistant",
    query: "query",
    stream: true,
    ending: "\\$ending",
    context: "You're super wise",
    containerObject: {
        nestedObjects: [{
                literal1: "literal1",
                literal2: "literal2",
                strProp: "strProp"
            }]
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

**request:** `SeedApi.SendRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `ReferenceClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

