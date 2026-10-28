# Reference
## Calls Calls
<details><summary><code>client.calls.calls.<a href="/src/api/resources/calls/resources/calls/client/Client.ts">createCall</a>() -> SeedApi.Call</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.calls.calls.createCall();

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

**requestOptions:** `CallsClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## Messages Messages
<details><summary><code>client.messages.messages.<a href="/src/api/resources/messages/resources/messages/client/Client.ts">listMessages</a>() -> SeedApi.Message[]</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.messages.messages.listMessages();

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

**requestOptions:** `MessagesClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.messages.messages.<a href="/src/api/resources/messages/resources/messages/client/Client.ts">createMessage</a>({ ...params }) -> SeedApi.Message</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.messages.messages.createMessage({
    sid: "sid",
    body: "body"
});

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

**request:** `SeedApi.Message` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `MessagesClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.messages.messages.<a href="/src/api/resources/messages/resources/messages/client/Client.ts">deleteMessage</a>({ ...params }) -> void</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.messages.messages.deleteMessage({
    sid: "sid"
});

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

**request:** `SeedApi.messages.DeleteMessageRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `MessagesClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

