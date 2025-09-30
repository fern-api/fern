# Reference
## headers
<details><summary><code>client.headers.send_(request) -> Seed::Types::SendResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```ruby
client.headers.send_({
  endpointVersion:'02-12-2024',
  async:true,
  query:'What is the weather today'
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

**endpointVersion:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**async:** `Internal::Types::Boolean` 
    
</dd>
</dl>

<dl>
<dd>

**query:** `String` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## inlined
<details><summary><code>client.inlined.send_(request) -> Seed::Types::SendResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```ruby
client.inlined.send_({
  temperature:10.1,
  prompt:'You are a helpful assistant',
  context:"You're super wise",
  aliasedContext:"You're super wise",
  maybeContext:"You're super wise",
  objectWithLiteral:{
    nestedLiteral:{
      myLiteral:'How super cool'
    }
  },
  stream:false,
  query:'What is the weather today'
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

**prompt:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**context:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**query:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**temperature:** `Integer` 
    
</dd>
</dl>

<dl>
<dd>

**stream:** `Internal::Types::Boolean` 
    
</dd>
</dl>

<dl>
<dd>

**aliasedContext:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**maybeContext:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**objectWithLiteral:** `Seed::Inlined::Types::ATopLevelLiteral` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## path
<details><summary><code>client.path.send_(id) -> Seed::Types::SendResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```ruby
client.path.send_();
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
</dd>
</dl>


</dd>
</dl>
</details>

## query
<details><summary><code>client.query.send_() -> Seed::Types::SendResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```ruby
client.query.send_({
  prompt:'You are a helpful assistant',
  optionalPrompt:'You are a helpful assistant',
  aliasPrompt:'You are a helpful assistant',
  aliasOptionalPrompt:'You are a helpful assistant',
  stream:false,
  optionalStream:false,
  aliasStream:false,
  aliasOptionalStream:false,
  query:'What is the weather today'
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

**prompt:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**optionalPrompt:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**aliasPrompt:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**aliasOptionalPrompt:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**query:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**stream:** `Internal::Types::Boolean` 
    
</dd>
</dl>

<dl>
<dd>

**optionalStream:** `Internal::Types::Boolean` 
    
</dd>
</dl>

<dl>
<dd>

**aliasStream:** `Internal::Types::Boolean` 
    
</dd>
</dl>

<dl>
<dd>

**aliasOptionalStream:** `Internal::Types::Boolean` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## reference
<details><summary><code>client.reference.send_(request) -> Seed::Types::SendResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```ruby
client.reference.send_({
  prompt:'You are a helpful assistant',
  stream:false,
  context:"You're super wise",
  query:'What is the weather today',
  containerObject:{
    nestedObjects:[{
      literal1:'literal1',
      literal2:'literal2',
      strProp:'strProp'
    }]
  }
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

**request:** `Seed::Reference::Types::SendRequest` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>
