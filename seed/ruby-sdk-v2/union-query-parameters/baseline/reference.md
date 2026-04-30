# Reference
## Events
<details><summary><code>client.events.<a href="/lib/seed/events/client.rb">subscribe</a>() -> String</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Subscribe to events with a oneOf-style query parameter that may be a
scalar enum value or a list of enum values.
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
client.events.subscribe(
  event_type: "group.created",
  tags: "tags"
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

**event_type:** `Seed::Events::Types::EventTypeParam` 
    
</dd>
</dl>

<dl>
<dd>

**tags:** `Seed::Events::Types::StringOrListParam` 
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `Seed::Events::RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

