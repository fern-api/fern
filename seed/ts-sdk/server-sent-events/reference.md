# Reference
## Completions
<details><summary><code>client.completions.<a href="/src/api/resources/completions/client/Client.ts">stream</a>({ ...params }) -> core.Stream&lt;SeedServerSentEvents.StreamedCompletion&gt;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
const response = await client.completions.stream({
    query: "foo"
});
for await (const item of response) {
    console.log(item);
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

**request:** `SeedServerSentEvents.StreamCompletionRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `CompletionsClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.completions.<a href="/src/api/resources/completions/client/Client.ts">streamWithoutTerminator</a>({ ...params }) -> core.Stream&lt;SeedServerSentEvents.StreamedCompletion&gt;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
const response = await client.completions.streamWithoutTerminator({
    query: "query"
});
for await (const item of response) {
    console.log(item);
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

**request:** `SeedServerSentEvents.StreamCompletionRequestWithoutTerminator` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `CompletionsClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

