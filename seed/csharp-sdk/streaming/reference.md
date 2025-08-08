# Reference
## Dummy
<details><summary><code>client.Dummy.<a href="/src/SeedStreaming/Dummy/DummyClient.cs">GenerateStreamAsync</a>(SeedStreaming.GenerateStreamRequest { ... }) -> System.Collections.Generic.IAsyncEnumerable<SeedStreaming.StreamResponse></code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
await client.Dummy.GenerateStreamAsync(
    new SeedStreaming.GenerateStreamRequest { Stream = true, NumEvents = 1 }
);
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

**request:** `SeedStreaming.GenerateStreamRequest` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.Dummy.<a href="/src/SeedStreaming/Dummy/DummyClient.cs">GenerateAsync</a>(SeedStreaming.Generateequest { ... }) -> SeedStreaming.StreamResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
await client.Dummy.GenerateAsync(
    new SeedStreaming.Generateequest { Stream = false, NumEvents = 5 }
);
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

**request:** `SeedStreaming.Generateequest` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>
