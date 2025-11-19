# Reference
## completions
<details><summary><code>client.completions.<a href="/src/api/resources/completions/client/Client.ts">stream</a>({ ...params }) -> core.Stream<SeedServerSentEvents.StreamedCompletion></code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
const response = await client.completions.stream({
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
