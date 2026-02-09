# Reference
## Completions
<details><summary><code>client.Completions.<a href="/src/SeedServerSentEvents/Completions/CompletionsClient.cs">StreamAsync</a>(StreamCompletionRequest { ... }) -> IAsyncEnumerable&lt;StreamedCompletion&gt;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
client.Completions.StreamAsync(new StreamCompletionRequest { Query = "query" });
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

**request:** `StreamCompletionRequest` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.Completions.<a href="/src/SeedServerSentEvents/Completions/CompletionsClient.cs">StreamWithoutTerminatorAsync</a>(StreamCompletionRequestWithoutTerminator { ... }) -> IAsyncEnumerable&lt;StreamedCompletion&gt;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
client.Completions.StreamWithoutTerminatorAsync(
    new StreamCompletionRequestWithoutTerminator { Query = "query" }
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

**request:** `StreamCompletionRequestWithoutTerminator` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>
