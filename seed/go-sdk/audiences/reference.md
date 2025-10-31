# Reference
## FolderA Service
<details><summary><code>client.FolderA.Service.GetDirectThread() -> *foldera.Response</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```go
request := &foldera.GetDirectThreadRequest{
        Ids: []string{
            "ids",
        },
        Tags: []string{
            "tags",
        },
    }
client.FolderA.Service.GetDirectThread(
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

**ids:** `string` 
    
</dd>
</dl>

<dl>
<dd>

**tags:** `string` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## FolderD Service
<details><summary><code>client.FolderD.Service.GetDirectThread() -> *folderd.Response</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```go
client.FolderD.Service.GetDirectThread(
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

## Foo
<details><summary><code>client.Foo.Find(request) -> *fern.ImportingType</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```go
request := &fern.FindRequest{
        OptionalString: fern.String(
            "optionalString",
        ),
        PublicProperty: fern.String(
            "publicProperty",
        ),
        PrivateProperty: fern.Int(
            1,
        ),
    }
client.Foo.Find(
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

**optionalString:** `fern.OptionalString` 
    
</dd>
</dl>

<dl>
<dd>

**publicProperty:** `*string` 
    
</dd>
</dl>

<dl>
<dd>

**privateProperty:** `*int` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>
