# Reference
## Identity
<details><summary><code>client.Identity.Gettoken(request) -> *fern.TokenResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```go
request := &fern.IdentityGetTokenRequest{
        Username: "username",
        Password: "password",
    }
client.Identity.Gettoken(
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

**username:** `string` 
    
</dd>
</dl>

<dl>
<dd>

**password:** `string` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## Plants
<details><summary><code>client.Plants.List() -> []*fern.Plant</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```go
client.Plants.List(
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

<details><summary><code>client.Plants.Get(PlantID) -> *fern.Plant</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```go
request := &fern.PlantsGetRequest{
        PlantID: "plantId",
    }
client.Plants.Get(
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

**plantID:** `string` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

