# Reference
## Completions
<details><summary><code>client.Completions.Stream(request) -> sse.StreamedCompletion</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```go
request := &sse.StreamCompletionRequest{
    Query: "foo",
}
_, err := client.Completions.Stream(
    context.TODO(),
    request,
)
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

**query:** `string` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.Completions.StreamEvents(request) -> sse.StreamEvent</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```go
request := &sse.StreamEventsRequest{
    Query: "query",
}
_, err := client.Completions.StreamEvents(
    context.TODO(),
    request,
)
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

**query:** `string` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.Completions.StreamEventsDiscriminantInData(request) -> sse.StreamEventDiscriminantInData</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```go
request := &sse.StreamEventsDiscriminantInDataRequest{
    Query: "query",
}
_, err := client.Completions.StreamEventsDiscriminantInData(
    context.TODO(),
    request,
)
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

**query:** `string` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.Completions.StreamEventsContextProtocol(request) -> sse.StreamEventContextProtocol</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```go
request := &sse.StreamEventsContextProtocolRequest{
    Query: "query",
}
_, err := client.Completions.StreamEventsContextProtocol(
    context.TODO(),
    request,
)
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

**query:** `string` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

