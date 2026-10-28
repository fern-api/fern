# Reference
## Items
<details><summary><code>client.Items.CreateItem(request) -> *fern.Item</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```go
request := &fern.CreateItemRequest{
    Name: "name",
}
_, err := client.Items.CreateItem(
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

**name:** `string` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.Items.GetItem(ItemID) -> *fern.Item</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```go
request := &fern.GetItemRequest{
    ItemID: "item_id",
}
_, err := client.Items.GetItem(
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

**itemID:** `string` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

