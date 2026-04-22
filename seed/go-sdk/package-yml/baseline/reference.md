# Reference
<details><summary><code>client.Echo(ID, request) -> string</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```go
request := &fern.EchoRequest{
        Name: "Hello world!",
        Size: 20,
    }
client.Echo(
        context.TODO(),
        "id-ksfd9c1",
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

**id:** `string` 
    
</dd>
</dl>

<dl>
<dd>

**request:** `*fern.EchoRequest` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## Service
<details><summary><code>client.Service.Nop(ID, NestedID) -> error</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```go
client.Service.Nop(
        context.TODO(),
        "id-a2ijs82",
        "id-219xca8",
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

**id:** `string` 
    
</dd>
</dl>

<dl>
<dd>

**nestedID:** `string` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

