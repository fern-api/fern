# Reference
## Events
<details><summary><code>client.Events.<a href="/src/SeedUnionQueryParameters/Events/EventsClient.cs">SubscribeAsync</a>(SubscribeEventsRequest { ... }) -> WithRawResponseTask&lt;string&gt;</code></summary>
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

```csharp
await client.Events.SubscribeAsync(
    new SubscribeEventsRequest { EventType = EventTypeEnum.GroupCreated, Tags = "tags" }
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

**request:** `SubscribeEventsRequest` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

