# Reference
## Conversations
<details><summary><code>client.conversations.<a href="/lib/seed/conversations/client.rb">outbound_call</a>(request) -> Seed::Conversations::Types::OutboundCallConversationsResponse</code></summary>
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

```ruby
client.conversations.outbound_call(to_phone_number: "to_phone_number")
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

**to_phone_number:** `String` — The phone number to call in E.164 format.
    
</dd>
</dl>

<dl>
<dd>

**dry_run:** `Internal::Types::Boolean` — If true, validates the outbound call setup without placing a call.
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `Seed::Conversations::RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## Users
<details><summary><code>client.users.<a href="/lib/seed/users/client.rb">get</a>(id) -> Seed::Types::User</code></summary>
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

```ruby
client.users.get(id: "id")
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

**id:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `Seed::Users::RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

