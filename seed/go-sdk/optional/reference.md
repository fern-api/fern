# Reference
## Optional
<details><summary><code>client.Optional.Sendoptionalbody(request) -> string</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```go
request := map[string]any{
        "key": "value",
    }
client.Optional.Sendoptionalbody(
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

**request:** `map[string]any` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.Optional.Sendoptionaltypedbody(request) -> string</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```go
request := &fern.SendOptionalBodyRequest{
        Message: "message",
    }
client.Optional.Sendoptionaltypedbody(
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

**message:** `string` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.Optional.Sendoptionalnullablewithalloptionalproperties(ActionID, ID, request) -> *fern.DeployResponse</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Tests optional(nullable(T)) where T has only optional properties.
This should not generate wire tests expecting {} when Optional.empty() is passed.
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
request := &fern.DeployParams{
        ActionID: "actionId",
        ID: "id",
    }
client.Optional.Sendoptionalnullablewithalloptionalproperties(
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

**actionID:** `string` 
    
</dd>
</dl>

<dl>
<dd>

**id:** `string` 
    
</dd>
</dl>

<dl>
<dd>

**updateDraft:** `*bool` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

