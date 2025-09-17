# Reference
## Unknown
<details><summary><code>client.Unknown.Post(request) -> []any</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```go
client.Unknown.Post(
        context.TODO(),
        map[string]any{
            "key": "value",
        },
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

**request:** `any` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.Unknown.PostObject(request) -> []any</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```go
client.Unknown.PostObject(
        context.TODO(),
        &fern.MyObject{
            Unknown: map[string]any{
                "key": "value",
            },
        },
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

**request:** `*fern.MyObject` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>
