# Reference
## Conversations
<details><summary><code>client.Conversations.<a href="/src/SeedApi/Conversations/ConversationsClient.cs">OutboundCallAsync</a>(OutboundCallConversationsRequest { ... }) -> WithRawResponseTask&lt;OutboundCallConversationsResponse&gt;</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Place an outbound call or validate call setup with dry_run.
</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
await client.Conversations.OutboundCallAsync(
    new OutboundCallConversationsRequest { ToPhoneNumber = "to_phone_number" }
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

**request:** `OutboundCallConversationsRequest` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## Users
<details><summary><code>client.Users.<a href="/src/SeedApi/Users/UsersClient.cs">GetAsync</a>(GetUsersRequest { ... }) -> WithRawResponseTask&lt;User&gt;</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Gets a user by ID. The deleted_at field uses type null.
</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
await client.Users.GetAsync(new GetUsersRequest { Id = "id" });
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

**request:** `GetUsersRequest` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

