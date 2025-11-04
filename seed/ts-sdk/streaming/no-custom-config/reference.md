# Reference
## Dummy
<details><summary><code>client.dummy.<a href="/src/api/resources/dummy/client/Client.ts">generateStream</a>({ ...params }) -> core.Stream<SeedStreaming.StreamResponse></code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
const response = await client.dummy.generateStream({
    num_events: 1
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

**request:** `GenerateStreamRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `Dummy.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.dummy.<a href="/src/api/resources/dummy/client/Client.ts">generate</a>({ ...params }) -> SeedStreaming.StreamResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.dummy.generate({
    num_events: 5
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

**request:** `Generateequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `Dummy.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>
