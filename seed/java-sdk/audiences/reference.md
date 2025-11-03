# Reference
## FolderA Service
<details><summary><code>client.folderA.service.getDirectThread() -> Response</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```java
client.folderA().service().getDirectThread(
    GetDirectThreadRequest
        .builder()
        .ids(
            Arrays.asList("ids")
        )
        .tags(
            Arrays.asList("tags")
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

**ids:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**tags:** `String` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## FolderD Service
<details><summary><code>client.folderD.service.getDirectThread() -> Response</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```java
client.folderD().service().getDirectThread();
```
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## Foo
<details><summary><code>client.foo.find(request) -> ImportingType</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```java
client.foo().find(
    FindRequest
        .builder()
        .optionalString("optionalString")
        .publicProperty("publicProperty")
        .privateProperty(1)
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

**optionalString:** `Optional<String>` 
    
</dd>
</dl>

<dl>
<dd>

**publicProperty:** `Optional<String>` 
    
</dd>
</dl>

<dl>
<dd>

**privateProperty:** `Optional<Integer>` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>
