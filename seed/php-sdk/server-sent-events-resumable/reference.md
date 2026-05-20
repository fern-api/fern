# Reference
## Completions
<details><summary><code>$client-&gt;completions-&gt;stream($request) -> SseStream</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```php
$client->completions->stream(
    new StreamCompletionRequest([
        'query' => 'foo',
    ]),
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

**$query:** `string` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>$client-&gt;completions-&gt;streamNonResumable($request) -> SseStream</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```php
$client->completions->streamNonResumable(
    new StreamCompletionRequestNonResumable([
        'query' => 'bar',
    ]),
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

**$query:** `string` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

