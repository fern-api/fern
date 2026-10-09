# Reference
## Completions
<details><summary><code>client.completions.stream(request) -> Iterable&amp;lt;StreamedCompletion&amp;gt;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```java
client.completions().stream(
    StreamCompletionRequest
        .builder()
        .query("foo")
        .build()
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

**query:** `String` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.completions.streamNonResumable(request) -> Iterable&amp;lt;StreamedCompletion&amp;gt;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```java
client.completions().streamNonResumable(
    StreamCompletionRequestNonResumable
        .builder()
        .query("bar")
        .build()
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

**query:** `String` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

