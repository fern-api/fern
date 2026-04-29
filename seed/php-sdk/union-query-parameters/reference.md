# Reference
## Events
<details><summary><code>$client-&gt;events-&gt;subscribe($request) -> ?string</code></summary>
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

```php
$client->events->subscribe(
    new SubscribeEventsRequest([
        'eventType' => EventTypeEnum::GroupCreated->value,
        'tags' => 'tags',
    ]),
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

**$eventType:** `string|array|null` 
    
</dd>
</dl>

<dl>
<dd>

**$tags:** `string|array|null` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

