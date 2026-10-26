# Reference
## Calls Calls
<details><summary><code>client.calls.calls.<a href="/lib/seed/calls/calls/client.rb">create_call</a>() -> Seed::Calls::Types::Call</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```ruby
client.calls.calls.create_call
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

**request_options:** `Seed::Calls::Calls::RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## Messages Messages
<details><summary><code>client.messages.messages.<a href="/lib/seed/messages/messages/client.rb">list_messages</a>() -> Internal::Types::Array[Seed::Messages::Types::Message]</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```ruby
client.messages.messages.list_messages
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

**request_options:** `Seed::Messages::Messages::RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.messages.messages.<a href="/lib/seed/messages/messages/client.rb">create_message</a>(request) -> Seed::Messages::Types::Message</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```ruby
client.messages.messages.create_message(
  sid: "sid",
  body: "body"
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

**request:** `Seed::Messages::Types::Message` 
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `Seed::Messages::Messages::RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.messages.messages.<a href="/lib/seed/messages/messages/client.rb">delete_message</a>(sid:) -> </code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```ruby
client.messages.messages.delete_message(sid: "sid")
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

**sid:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `Seed::Messages::Messages::RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

