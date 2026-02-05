# Reference
## Dummy
<details><summary><code>$client-&gt;dummy-&gt;generateStream($request)</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```php
$client->dummy->generateStream(
    new GenerateStreamRequest([
        'stream' => true,
        'numEvents' => 1,
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

**$stream:** `bool` 
    
</dd>
</dl>

<dl>
<dd>

**$numEvents:** `int` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>$client-&gt;dummy-&gt;generate($request) -> StreamResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```php
$client->dummy->generate(
    new Generateequest([
        'stream' => false,
        'numEvents' => 5,
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

**$stream:** `bool` 
    
</dd>
</dl>

<dl>
<dd>

**$numEvents:** `int` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>
