# Reference
## Organization
<details><summary><code>client.organization.<a href="/lib/seed/organization/client.rb">create</a>(request) -> Seed::Organization::Types::Organization</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Create a new organization.
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
client.organization.create(name: 'name');
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

**request:** `Seed::Organization::Types::CreateOrganizationRequest` 
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `Seed::Organization::RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## User
<details><summary><code>client.user.<a href="/lib/seed/user/client.rb">list</a>() -> Internal::Types::Array[Seed::User::Types::User]</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

List all users.
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
client.user.list(limit: 1);
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

**limit:** `Integer` — The maximum number of results to return.
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `Seed::User::RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## User Events
<details><summary><code>client.user.events.<a href="/lib/seed/user/events/client.rb">list_events</a>() -> Internal::Types::Array[Seed::User::Events::Types::Event]</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

List all user events.
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
client.user.events.list_events(limit: 1);
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

**limit:** `Integer` — The maximum number of results to return.
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `Seed::User::Events::RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## User Events Metadata
<details><summary><code>client.user.events.metadata.<a href="/lib/seed/user/events/metadata/client.rb">get_metadata</a>() -> Seed::User::Events::Metadata::Types::Metadata</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Get event metadata.
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
client.user.events.metadata.get_metadata(id: 'id');
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

**request_options:** `Seed::User::Events::Metadata::RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>
