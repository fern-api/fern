# Reference
<details><summary><code>client.<a href="/lib/seed/client.rb">search_rule_types</a>() -> Seed::Types::RuleTypeSearchResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```ruby
client.search_rule_types
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

**query:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `Seed::RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.<a href="/lib/seed/client.rb">create_rule</a>(request) -> Seed::Types::RuleResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```ruby
client.create_rule(
  name: "name",
  execution_context: "prod"
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

**name:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**execution_context:** `Seed::Types::RuleCreateRequestExecutionContext` — Execution context for the rule, excluding the prod environment.
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `Seed::RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.<a href="/lib/seed/client.rb">list_users</a>() -> Seed::Types::UserSearchResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```ruby
client.list_users
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

**request_options:** `Seed::RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.<a href="/lib/seed/client.rb">get_entity</a>() -> Seed::Types::CombinedEntity</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```ruby
client.get_entity
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

**request_options:** `Seed::RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.<a href="/lib/seed/client.rb">get_organization</a>() -> Seed::Types::Organization</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```ruby
client.get_organization
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

**request_options:** `Seed::RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.<a href="/lib/seed/client.rb">create_plant</a>(request) -> Seed::Types::PlantStrict</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Tests three-level allOf chain where a parent schema itself uses allOf with $ref elements. The grandparent's properties must be resolved through the nested $ref.
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
client.create_plant(
  species: "species",
  family: "family",
  genus: "genus",
  sun_exposure: "full"
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

**sun_exposure:** `Seed::Types::PlantPostSunExposure` — Required sun exposure level.
    
</dd>
</dl>

<dl>
<dd>

**planted_at:** `String` — Date the plant was planted.
    
</dd>
</dl>

<dl>
<dd>

**soil_type:** `String` — Preferred soil type.
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `Seed::RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.<a href="/lib/seed/client.rb">create_tree</a>(request) -> Seed::Types::TreeRecord</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Tests that when a parent's allOf contains multiple $ref entries, all of them are resolved and their properties merged.
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
client.create_tree(id: "id")
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

**request:** `Seed::Types::TreeRecord` 
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `Seed::RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

