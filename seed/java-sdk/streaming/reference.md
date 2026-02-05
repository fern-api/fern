# Reference
## Dummy
<details><summary><code>client.dummy.generateStream(request) -> Optional&lt;StreamResponse&gt;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```java
client.dummy().generateStream(
    GenerateStreamRequest
        .builder()
        .numEvents(1)
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

**stream:** `Boolean` 
    
</dd>
</dl>

<dl>
<dd>

**numEvents:** `Integer` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.dummy.generate(request) -> StreamResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```java
client.dummy().generate(
    Generateequest
        .builder()
        .numEvents(5)
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

**stream:** `Boolean` 
    
</dd>
</dl>

<dl>
<dd>

**numEvents:** `Integer` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>
