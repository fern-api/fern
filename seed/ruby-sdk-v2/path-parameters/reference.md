# Reference
## Organizations
<details><summary><code>client.organizations.<a href="/lib/fern_path_parameters/organizations/client.rb">get_organization</a>(tenant_id, organization_id) -> FernPathParameters::Organizations::Types::Organization</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```ruby
client.organizations.get_organization(organization_id: 'organization_id');
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

**tenant_id:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**organization_id:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `FernPathParameters::Organizations::RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.organizations.<a href="/lib/fern_path_parameters/organizations/client.rb">get_organization_user</a>(tenant_id, organization_id, user_id) -> FernPathParameters::User::Types::User</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```ruby
client.organizations.get_organization_user(
  organization_id: 'organization_id',
  user_id: 'user_id'
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

**tenant_id:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**organization_id:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**user_id:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `FernPathParameters::Organizations::RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.organizations.<a href="/lib/fern_path_parameters/organizations/client.rb">search_organizations</a>(tenant_id, organization_id) -> Internal::Types::Array[FernPathParameters::Organizations::Types::Organization]</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```ruby
client.organizations.search_organizations(
  organization_id: 'organization_id',
  limit: 1
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

**tenant_id:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**organization_id:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**limit:** `Integer` 
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `FernPathParameters::Organizations::RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## User
<details><summary><code>client.user.<a href="/lib/fern_path_parameters/user/client.rb">get_user</a>(tenant_id, user_id) -> FernPathParameters::User::Types::User</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```ruby
client.user.get_user(user_id: 'user_id');
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

**tenant_id:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**user_id:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `FernPathParameters::User::RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.user.<a href="/lib/fern_path_parameters/user/client.rb">create_user</a>(tenant_id, request) -> FernPathParameters::User::Types::User</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```ruby
client.user.create_user(
  name: 'name',
  tags: ['tags', 'tags']
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

**tenant_id:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**request:** `FernPathParameters::User::Types::User` 
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `FernPathParameters::User::RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.user.<a href="/lib/fern_path_parameters/user/client.rb">update_user</a>(tenant_id, user_id, request) -> FernPathParameters::User::Types::User</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```ruby
client.user.update_user(
  user_id: 'user_id',
  name: 'name',
  tags: ['tags', 'tags']
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

**tenant_id:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**user_id:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**request:** `FernPathParameters::User::Types::User` 
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `FernPathParameters::User::RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.user.<a href="/lib/fern_path_parameters/user/client.rb">search_users</a>(tenant_id, user_id) -> Internal::Types::Array[FernPathParameters::User::Types::User]</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```ruby
client.user.search_users(
  user_id: 'user_id',
  limit: 1
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

**tenant_id:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**user_id:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**limit:** `Integer` 
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `FernPathParameters::User::RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.user.<a href="/lib/fern_path_parameters/user/client.rb">get_user_metadata</a>(tenant_id, user_id, version) -> FernPathParameters::User::Types::User</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Test endpoint with path parameter that has a text prefix (v{version})
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
client.user.get_user_metadata(
  user_id: 'user_id',
  version: 1
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

**tenant_id:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**user_id:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**version:** `Integer` 
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `FernPathParameters::User::RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.user.<a href="/lib/fern_path_parameters/user/client.rb">get_user_specifics</a>(tenant_id, user_id, version, thought) -> FernPathParameters::User::Types::User</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Test endpoint with path parameters listed in different order than found in path
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
client.user.get_user_specifics(
  user_id: 'user_id',
  version: 1,
  thought: 'thought'
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

**tenant_id:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**user_id:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**version:** `Integer` 
    
</dd>
</dl>

<dl>
<dd>

**thought:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `FernPathParameters::User::RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>
