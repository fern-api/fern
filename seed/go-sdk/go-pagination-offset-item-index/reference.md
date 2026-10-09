# Reference
## Plants
<details><summary><code>client.Plants.List() -> *fern.ListPlantsResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```go
request := &fern.ListPlantsRequest{
    Offset: fern.Int(
        1,
    ),
    Count: fern.Int(
        1,
    ),
}
client.Plants.List(
    context.TODO(),
    request,
)
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

**offset:** `*int` 
    
</dd>
</dl>

<dl>
<dd>

**count:** `*int` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.Plants.ListWithRequiredOffset() -> *fern.ListPlantsResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```go
request := &fern.ListPlantsWithRequiredOffsetRequest{
    Offset: 1,
    Count: 1,
}
client.Plants.ListWithRequiredOffset(
    context.TODO(),
    request,
)
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

**offset:** `int` 
    
</dd>
</dl>

<dl>
<dd>

**count:** `int` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.Plants.ListWithBodyOffset(request) -> *fern.ListPlantsResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```go
request := &fern.ListPlantsWithBodyOffsetRequest{
    Offset: fern.Int(
        1,
    ),
    Count: fern.Int(
        1,
    ),
}
client.Plants.ListWithBodyOffset(
    context.TODO(),
    request,
)
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

**offset:** `*int` 
    
</dd>
</dl>

<dl>
<dd>

**count:** `*int` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

