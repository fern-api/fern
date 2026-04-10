# Reference
## Union
<details><summary><code>client.union.<a href="/lib/seed/union/client.rb">get</a>(request) -> Seed::Types::MyUnion</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```ruby
client.union.get(request: "string")
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

**request:** `Seed::Types::MyUnion` 
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `Seed::Union::RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.union.<a href="/lib/seed/union/client.rb">getmetadata</a>() -> Internal::Types::Hash[String, String]</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```ruby
client.union.getmetadata
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

**request_options:** `Seed::Union::RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.union.<a href="/lib/seed/union/client.rb">updatemetadata</a>(request) -> Internal::Types::Boolean</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```ruby
client.union.updatemetadata(request: {})
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

**request:** `Seed::Types::MetadataUnion` 
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `Seed::Union::RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.union.<a href="/lib/seed/union/client.rb">call</a>(request) -> Internal::Types::Boolean</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```ruby
client.union.call
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

**union:** `Seed::Types::MetadataUnion` 
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `Seed::Union::RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.union.<a href="/lib/seed/union/client.rb">duplicatetypesunion</a>(request) -> Seed::Types::UnionWithDuplicateTypes</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```ruby
client.union.duplicatetypesunion(request: "string")
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

**request:** `Seed::Types::UnionWithDuplicateTypes` 
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `Seed::Union::RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.union.<a href="/lib/seed/union/client.rb">nestedunions</a>(request) -> String</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```ruby
client.union.nestedunions(request: "string")
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

**request:** `Seed::Types::NestedUnionRoot` 
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `Seed::Union::RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.union.<a href="/lib/seed/union/client.rb">testcamelcaseproperties</a>(request) -> String</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```ruby
client.union.testcamelcaseproperties(payment_method: {
  method_: "method",
  card_number: "cardNumber"
})
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

**payment_method:** `Seed::Types::PaymentMethodUnion` 
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `Seed::Union::RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

