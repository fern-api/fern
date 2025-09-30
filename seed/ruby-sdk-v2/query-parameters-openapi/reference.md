# Reference
<details><summary><code>client.search() -> Seed::Types::SearchResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```ruby
client.search(
  limit: 1,
  id: 'id',
  date: 'date',
  deadline: '2024-01-15T09:30:00Z',
  bytes: 'bytes',
  user: {
    name:'name',
    tags:['tags', 'tags']
  },
  userList: ,
  optionalDeadline: '2024-01-15T09:30:00Z',
  keyValue: {
    keyValue:'keyValue'
  },
  optionalString: 'optionalString',
  nestedUser: {
    name:'name',
    user:{
      name:'name',
      tags:['tags', 'tags']
    }
  },
  optionalUser: {
    name:'name',
    tags:['tags', 'tags']
  },
  excludeUser: ,
  filter: ,
  neighbor: {
    name:'name',
    tags:['tags', 'tags']
  },
  neighborRequired: 
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

**limit:** `Integer` 
    
</dd>
</dl>

<dl>
<dd>

**id:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**date:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**deadline:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**bytes:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**user:** `Seed::Types::User` 
    
</dd>
</dl>

<dl>
<dd>

**userList:** `Seed::Types::User` 
    
</dd>
</dl>

<dl>
<dd>

**optionalDeadline:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**keyValue:** `Internal::Types::Hash[String, String]` 
    
</dd>
</dl>

<dl>
<dd>

**optionalString:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**nestedUser:** `Seed::Types::NestedUser` 
    
</dd>
</dl>

<dl>
<dd>

**optionalUser:** `Seed::Types::User` 
    
</dd>
</dl>

<dl>
<dd>

**excludeUser:** `Seed::Types::User` 
    
</dd>
</dl>

<dl>
<dd>

**filter:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**neighbor:** `Seed::Types::User` 
    
</dd>
</dl>

<dl>
<dd>

**neighborRequired:** `Seed::Types::SearchRequestNeighborRequired` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>
