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

<details><summary><code>client.completions.streamEvents(request) -> Iterable&amp;lt;StreamEvent&amp;gt;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```java
client.completions().streamEvents(
    StreamEventsRequest
        .builder()
        .query("query")
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

<details><summary><code>client.completions.streamEventsDiscriminantInData(request) -> Iterable&amp;lt;StreamEventDiscriminantInData&amp;gt;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```java
client.completions().streamEventsDiscriminantInData(
    StreamEventsDiscriminantInDataRequest
        .builder()
        .query("query")
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

<details><summary><code>client.completions.streamEventsContextProtocol(request) -> Iterable&amp;lt;StreamEventContextProtocol&amp;gt;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```java
client.completions().streamEventsContextProtocol(
    StreamEventsContextProtocolRequest
        .builder()
        .query("query")
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

