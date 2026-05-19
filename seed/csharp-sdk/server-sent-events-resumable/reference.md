# Reference
## Completions
<details><summary><code>client.Completions.<a href="/src/SeedServerSentEventsResumable/Completions/CompletionsClient.cs">StreamAsync</a>(StreamCompletionRequest { ... }) -> IAsyncEnumerable&lt;StreamedCompletion&gt;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
client.Completions.StreamAsync(new StreamCompletionRequest { Query = "foo" });
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

<details><summary><code>client.Completions.<a href="/src/SeedServerSentEventsResumable/Completions/CompletionsClient.cs">StreamNonResumableAsync</a>(StreamCompletionRequestNonResumable { ... }) -> IAsyncEnumerable&lt;StreamedCompletion&gt;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
client.Completions.StreamNonResumableAsync(
    new StreamCompletionRequestNonResumable { Query = "bar" }
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

**request:** `StreamCompletionRequestNonResumable` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

