# Reference
## Dummy
<details><summary><code>client.dummy.<a href="/src/api/resources/dummy/client/Client.ts">generate</a>({ ...params }) -> core.Stream<SeedStreaming.StreamResponse></code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
const response = await client.dummy.generate({
    stream: false,
    num_events: 5
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

**request:** `SeedStreaming.GenerateRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `DummyClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>
