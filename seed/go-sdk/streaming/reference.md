# Reference
## Dummy
<details><summary><code>client.Dummy.GenerateStream(request) -> v2.StreamResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```go
client.Dummy.GenerateStream(
        context.TODO(),
        &v2.GenerateStreamRequest{
            NumEvents: 1,
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

**stream:** `bool` 
    
</dd>
</dl>

<dl>
<dd>

**numEvents:** `int` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.Dummy.Generate(request) -> *v2.StreamResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```go
client.Dummy.Generate(
        context.TODO(),
        &v2.Generateequest{
            NumEvents: 5,
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

**stream:** `bool` 
    
</dd>
</dl>

<dl>
<dd>

**numEvents:** `int` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>
