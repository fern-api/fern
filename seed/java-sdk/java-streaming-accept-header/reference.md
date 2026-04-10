# Reference
## Dummy
<details><summary><code>client.dummy.generateStream(request) -> InputStream</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```java
client.dummy().generateStream(
    DummyGenerateStreamRequest
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
    DummyGenerateRequest
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

**numEvents:** `Integer` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

