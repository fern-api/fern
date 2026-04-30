# Reference
## Events
<details><summary><code>client.events.subscribe() -> String</code></summary>
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

```java
client.events().subscribe(
    SubscribeEventsRequest
        .builder()
        .eventType(
            EventTypeParam.of(EventTypeEnum.GROUP_CREATED)
        )
        .tags(
            StringOrListParam.of("tags")
        )
        .build()
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

**eventType:** `Optional<EventTypeParam>` 
    
</dd>
</dl>

<dl>
<dd>

**tags:** `Optional<StringOrListParam>` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

