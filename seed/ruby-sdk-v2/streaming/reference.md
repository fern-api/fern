# Reference
## Dummy
<details><summary><code>client.dummy.generate_stream(request) -> Seed::Dummy::Types::StreamResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```ruby
client.dummy.generate_stream({
  stream:true,
  numEvents:1
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

**stream:** `Internal::Types::Boolean` 
    
</dd>
</dl>

<dl>
<dd>

**numEvents:** `Integer` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.dummy.generate(request) -> Seed::Dummy::Types::StreamResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```ruby
client.dummy.generate({
  stream:false,
  numEvents:5
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

**stream:** `Internal::Types::Boolean` 
    
</dd>
</dl>

<dl>
<dd>

**numEvents:** `Integer` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>
