# Reference
## Dummy
<details><summary><code>client.Dummy.GenerateStream(request) -> stream.StreamResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```go
request := &stream.GenerateStreamRequest{
        NumEvents: 1,
    }
client.Dummy.GenerateStream(
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

<details><summary><code>client.Dummy.Generate(request) -> *stream.StreamResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```go
request := &stream.Generateequest{
        NumEvents: 5,
    }
client.Dummy.Generate(
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
