# Reference
## Service
<details><summary><code>client.service.get_resource(resource_id) -> Seed::Service::Types::Resource</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```ruby
client.service.get_resource('rsc-xyz');
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

**resource_id:** `String` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.service.list_resources() -> Internal::Types::Array[Seed::Service::Types::Resource]</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```ruby
client.service.list_resources(
  pageLimit: 10,
  beforeDate: '2023-01-01'
);
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

**page_limit:** `Integer` 
    
</dd>
</dl>

<dl>
<dd>

**before_date:** `String` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>
