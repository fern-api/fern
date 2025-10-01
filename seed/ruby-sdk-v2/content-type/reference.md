# Reference
## Service
<details><summary><code>client.Service.Patch(request) -> </code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```ruby
client.service.patch({
  application:'application',
  requireAuth:true
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

**application:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**requireAuth:** `Internal::Types::Boolean` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.Service.PatchComplex(Id, request) -> </code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Update with JSON merge patch - complex types.
This endpoint demonstrates the distinction between:
- optional<T> fields (can be present or absent, but not null)
- optional<nullable<T>> fields (can be present, absent, or null)
</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```ruby
client.service.patch_complex({
  id:'id',
  name:'name',
  age:1,
  active:true,
  metadata:{},
  tags:['tags', 'tags'],
  email:'email',
  nickname:'nickname',
  bio:'bio',
  profileImageUrl:'profileImageUrl',
  settings:{}
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

**id:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**name:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**age:** `Integer` 
    
</dd>
</dl>

<dl>
<dd>

**active:** `Internal::Types::Boolean` 
    
</dd>
</dl>

<dl>
<dd>

**metadata:** `Internal::Types::Hash[String, Internal::Types::Hash[String, Object]]` 
    
</dd>
</dl>

<dl>
<dd>

**tags:** `Internal::Types::Array[String]` 
    
</dd>
</dl>

<dl>
<dd>

**email:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**nickname:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**bio:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**profileImageUrl:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**settings:** `Internal::Types::Hash[String, Internal::Types::Hash[String, Object]]` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.Service.NamedPatchWithMixed(Id, request) -> </code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Named request with mixed optional/nullable fields and merge-patch content type.
This should trigger the NPE issue when optional fields aren't initialized.
</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```ruby
client.service.named_patch_with_mixed({
  id:'id',
  appId:'appId',
  instructions:'instructions',
  active:true
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

**id:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**appId:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**instructions:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**active:** `Internal::Types::Boolean` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.Service.OptionalMergePatchTest(request) -> </code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Test endpoint to verify Optional field initialization and JsonSetter with Nulls.SKIP.
This endpoint should:
1. Not NPE when fields are not provided (tests initialization)
2. Not NPE when fields are explicitly null in JSON (tests Nulls.SKIP)
</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```ruby
client.service.optional_merge_patch_test({
  requiredField:'requiredField',
  optionalString:'optionalString',
  optionalInteger:1,
  optionalBoolean:true,
  nullableString:'nullableString'
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

**requiredField:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**optionalString:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**optionalInteger:** `Integer` 
    
</dd>
</dl>

<dl>
<dd>

**optionalBoolean:** `Internal::Types::Boolean` 
    
</dd>
</dl>

<dl>
<dd>

**nullableString:** `String` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.Service.RegularPatch(Id, request) -> </code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Regular PATCH endpoint without merge-patch semantics
</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```ruby
client.service.regular_patch({
  id:'id',
  field1:'field1',
  field2:1
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

**id:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**field1:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**field2:** `Integer` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>
