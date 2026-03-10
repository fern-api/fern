# Reference
## Entities
<details><summary><code>client.Entities.GetEntities() -> fern.Components</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```go
client.Entities.GetEntities(
        context.TODO(),
    )
}
```
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.Entities.AddEntity(request) -> error</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```go
request := &fern.AddEntityOverrideRequest{}
client.Entities.AddEntity(
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

**maskedComponent:** `*fern.Component` — The json component value that contains the field being overridden.
    
</dd>
</dl>

<dl>
<dd>

**overrideValue:** `*fern.OverrideValue` — The override value.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

