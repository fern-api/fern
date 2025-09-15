# Reference
## Service
<details><summary><code>client.Service.GetResource(ResourceId) -> Seed::Service::Types::Resource</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```ruby
client.service.get_resource();
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

**resourceId:** `String` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.Service.ListResources() -> Internal::Types::Array[Seed::Service::Types::Resource]</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```ruby
client.service.list_resources({
  pageLimit:10,
  beforeDate:'2023-01-01'
});
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

**pageLimit:** `Integer` 
    
</dd>
</dl>

<dl>
<dd>

**beforeDate:** `String` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>
