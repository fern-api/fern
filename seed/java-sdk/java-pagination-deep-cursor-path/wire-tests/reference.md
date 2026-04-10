# Reference
## Deepcursorpath
<details><summary><code>client.deepcursorpath.doThing(request) -> Response</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```java
client.deepcursorpath().doThing(
    A
        .builder()
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

**b:** `Optional<B>` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.deepcursorpath.doThingRequired(request) -> Response</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```java
client.deepcursorpath().doThingRequired(
    MainRequired
        .builder()
        .indirection(
            IndirectionRequired
                .builder()
                .results(
                    Arrays.asList("results")
                )
                .build()
        )
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

**indirection:** `IndirectionRequired` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.deepcursorpath.doThingInline(request) -> Response</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```java
client.deepcursorpath().doThingInline(
    InlineA
        .builder()
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

**b:** `Optional<InlineB>` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

