# Reference
## Calls Calls
<details><summary><code>client.Calls.Calls.<a href="/src/SeedApi/Calls/Calls/CallsClient_.cs">CreateCallAsync</a>() -> WithRawResponseTask&lt;Call&gt;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
await client.Calls.Calls.CreateCallAsync();
```
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## Messages Messages
<details><summary><code>client.Messages.Messages.<a href="/src/SeedApi/Messages/Messages/MessagesClient_.cs">ListMessagesAsync</a>() -> WithRawResponseTask&lt;IEnumerable&lt;Message&gt;&gt;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
await client.Messages.Messages.ListMessagesAsync();
```
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.Messages.Messages.<a href="/src/SeedApi/Messages/Messages/MessagesClient_.cs">CreateMessageAsync</a>(Message { ... }) -> WithRawResponseTask&lt;Message&gt;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
await client.Messages.Messages.CreateMessageAsync(new Message { Sid = "sid", Body = "body" });
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

**request:** `Message` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.Messages.Messages.<a href="/src/SeedApi/Messages/Messages/MessagesClient_.cs">DeleteMessageAsync</a>(DeleteMessageRequest { ... }) -> WithRawResponseTask</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
await client.Messages.Messages.DeleteMessageAsync(new DeleteMessageRequest { Sid = "sid" });
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

**request:** `DeleteMessageRequest` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

