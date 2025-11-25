# Reference
## TestGroup
<details><summary><code>client.TestGroup.TestMethodName(PathParam, request) -> any</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Post a nullable request body
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
request := &fern.TestMethodNameTestGroupRequest{
        PathParam: "path_param",
        Body: &fern.PlainObject{},
    }
client.TestGroup.TestMethodName(
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

**pathParam:** `string` 
    
</dd>
</dl>

<dl>
<dd>

**queryParamObject:** `*fern.PlainObject` 
    
</dd>
</dl>

<dl>
<dd>

**queryParamInteger:** `*int` 
    
</dd>
</dl>

<dl>
<dd>

**request:** `*fern.PlainObject` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>
