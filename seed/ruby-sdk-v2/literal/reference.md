# Reference
## Headers
<details><summary><code>client.headers.<a href="/lib/seed/headers/client.rb">send_</a>(request) -> Seed::Types::SendResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```ruby
client.headers.send_(
  endpoint_version: "02-12-2024",
  async: true,
  query: "query"
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

**endpoint_version:** `Seed::Headers::Types::HeadersSendRequestXEndpointVersion` 
    
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

<dl>
<dd>

**request_options:** `Seed::Headers::RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## Inlined
<details><summary><code>client.inlined.<a href="/lib/seed/inlined/client.rb">send_</a>(request) -> Seed::Types::SendResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```ruby
client.inlined.send_(
  prompt: "You are a helpful assistant",
  query: "query",
  stream: true,
  aliased_context: "You're super wise",
  object_with_literal: {
    nested_literal: {
      my_literal: "How super cool"
    }
  }
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

**prompt:** `Seed::Inlined::Types::InlinedSendRequestPrompt` 
    
</dd>
</dl>

<dl>
<dd>

**context:** `Seed::Inlined::Types::InlinedSendRequestContext` 
    
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

**aliased_context:** `Seed::Types::SomeAliasedLiteral` 
    
</dd>
</dl>

<dl>
<dd>

**maybe_context:** `Seed::Types::SomeAliasedLiteral` 
    
</dd>
</dl>

<dl>
<dd>

**object_with_literal:** `Seed::Types::ATopLevelLiteral` 
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `Seed::Inlined::RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## Path
<details><summary><code>client.path.<a href="/lib/seed/path/client.rb">send_</a>(id) -> Seed::Types::SendResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```ruby
client.path.send_(id: "123")
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

**id:** `Seed::Path::Types::PathSendRequestID` 
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `Seed::Path::RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## Query
<details><summary><code>client.query.<a href="/lib/seed/query/client.rb">send_</a>() -> Seed::Types::SendResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```ruby
client.query.send_(
  prompt: "You are a helpful assistant",
  alias_prompt: "You are a helpful assistant",
  query: "query",
  stream: true,
  alias_stream: true
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

**prompt:** `Seed::Query::Types::QuerySendRequestPrompt` 
    
</dd>
</dl>

<dl>
<dd>

**optional_prompt:** `Seed::Query::Types::QuerySendRequestOptionalPrompt` 
    
</dd>
</dl>

<dl>
<dd>

**alias_prompt:** `Seed::Types::AliasToPrompt` 
    
</dd>
</dl>

<dl>
<dd>

**alias_optional_prompt:** `Seed::Types::AliasToPrompt` 
    
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

<dl>
<dd>

**request_options:** `Seed::Query::RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## Reference
<details><summary><code>client.reference.<a href="/lib/seed/reference/client.rb">send_</a>(request) -> Seed::Types::SendResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```ruby
client.reference.send_(
  prompt: "You are a helpful assistant",
  query: "query",
  stream: true,
  ending: "$ending",
  context: "You're super wise",
  container_object: {
    nested_objects: [{
      literal1: "literal1",
      literal2: "literal2",
      str_prop: "strProp"
    }]
  }
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

**prompt:** `Seed::Reference::Types::SendRequestPrompt` 
    
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

**ending:** `Seed::Reference::Types::SendRequestEnding` 
    
</dd>
</dl>

<dl>
<dd>

**context:** `Seed::Types::SomeLiteral` 
    
</dd>
</dl>

<dl>
<dd>

**maybe_context:** `Seed::Types::SomeLiteral` 
    
</dd>
</dl>

<dl>
<dd>

**container_object:** `Seed::Types::ContainerObject` 
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `Seed::Reference::RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

