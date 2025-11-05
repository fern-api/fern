# Reference
## Dummy
<details><summary><code>client.Dummy.<a href="/src/SeedStreaming/Dummy/DummyClient.cs">GenerateStreamAsync</a>(GenerateStreamRequest { ... }) -> IAsyncEnumerable<StreamResponse></code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
client.Dummy.GenerateStreamAsync(new GenerateStreamRequest { Stream = true, NumEvents = 1 });
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
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.Dummy.<a href="/src/SeedStreaming/Dummy/DummyClient.cs">GenerateAsync</a>(Generateequest { ... }) -> StreamResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
await client.Dummy.GenerateAsync(new Generateequest { Stream = false, NumEvents = 5 });
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
</dd>
</dl>


</dd>
</dl>
</details>
