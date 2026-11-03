# Reference
## Calls Calls
<details><summary><code>client.Calls.Calls.CreateCall() -> *calls.Call</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```go
_, err := client.Calls.Calls.CreateCall(
    context.TODO(),
)
```
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## Messages Messages
<details><summary><code>client.Messages.Messages.ListMessages() -> []*messages.Message</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```go
_, err := client.Messages.Messages.ListMessages(
    context.TODO(),
)
```
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.Messages.Messages.CreateMessage(request) -> *messages.Message</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```go
request := &messages.Message{
    Sid: "sid",
    Body: "body",
}
_, err := client.Messages.Messages.CreateMessage(
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

**request:** `*messages.Message` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.Messages.Messages.DeleteMessage(Sid) -> error</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```go
request := &messages.DeleteMessageRequest{
    Sid: "sid",
}
err := client.Messages.Messages.DeleteMessage(
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

**sid:** `string` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

