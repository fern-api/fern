# Reference
## Headers
<details><summary><code>client.headers.send_(request) -> Seed::Types::SendResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```ruby
client.headers.send_(
  endpoint_version: '02-12-2024',
  async: true,
  query: 'What is the weather today'
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

**endpoint_version:** `String` 
    
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

## Inlined
<details><summary><code>client.inlined.send_(request) -> Seed::Types::SendResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```ruby
client.inlined.send_(
  temperature: 10.1,
  prompt: 'You are a helpful assistant',
  context: "You're super wise",
  aliased_context: "You're super wise",
  maybe_context: "You're super wise",
  object_with_literal: {
    nested_literal: {
      my_literal: 'How super cool'
    }
  },
  stream: false,
  query: 'What is the weather today'
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

**aliased_context:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**maybe_context:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**object_with_literal:** `Seed::Inlined::Types::ATopLevelLiteral` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## Path
<details><summary><code>client.path.send_(id) -> Seed::Types::SendResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```ruby
client.path.send_('123');
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

## Query
<details><summary><code>client.query.send_() -> Seed::Types::SendResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```ruby
client.query.send_(
  prompt: 'You are a helpful assistant',
  optional_prompt: 'You are a helpful assistant',
  alias_prompt: 'You are a helpful assistant',
  alias_optional_prompt: 'You are a helpful assistant',
  stream: false,
  optional_stream: false,
  alias_stream: false,
  alias_optional_stream: false,
  query: 'What is the weather today'
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

**prompt:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**optional_prompt:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**alias_prompt:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**alias_optional_prompt:** `String` 
    
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

**optional_stream:** `Internal::Types::Boolean` 
    
</dd>
</dl>

<dl>
<dd>

**alias_stream:** `Internal::Types::Boolean` 
    
</dd>
</dl>

<dl>
<dd>

**alias_optional_stream:** `Internal::Types::Boolean` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## Reference
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
  prompt: 'You are a helpful assistant',
  stream: false,
  context: "You're super wise",
  query: 'What is the weather today',
  container_object: {
    nested_objects: [{
      literal_1: 'literal1',
      literal_2: 'literal2',
      str_prop: 'strProp'
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
