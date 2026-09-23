# Reference
<details><summary><code>client.GetTransactions(request) -> *fern.TransactionsGetResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```go
request := &fern.TransactionsGetRequest{
    AccessToken: "access_token",
}
client.GetTransactions(
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

**accessToken:** `string` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.CreatePlant(request) -> *fern.PlantDetails</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```go
request := &fern.PlantCreate{
    Species: "species",
}
client.CreatePlant(
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

**nickname:** `*string` 
    
</dd>
</dl>

<dl>
<dd>

**species:** `string` 
    
</dd>
</dl>

<dl>
<dd>

**legacyTag:** `*string` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

