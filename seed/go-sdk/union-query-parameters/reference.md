# Reference
## Events
<details><summary><code>client.Events.Subscribe() -> string</code></summary>
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

```go
request := &fern.SubscribeEventsRequest{
        EventType: &fern.EventTypeParam{
            EventTypeEnum: fern.EventTypeEnumGroupCreated,
        },
        Tags: &fern.StringOrListParam{
            String: "tags",
        },
    }
client.Events.Subscribe(
        context.TODO(),
        request,
    )
}
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

**eventType:** `*fern.EventTypeParam` 
    
</dd>
</dl>

<dl>
<dd>

**tags:** `*fern.StringOrListParam` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

