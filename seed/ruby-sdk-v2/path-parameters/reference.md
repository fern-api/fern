# Reference
## Organizations
<details><summary><code>client.Organizations.GetOrganization(TenantId, OrganizationId) -> Seed::Organizations::Types::Organization</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```ruby
client.organizations.get_organization();
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

**tenantId:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**organizationId:** `String` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.Organizations.GetOrganizationUser(TenantId, OrganizationId, UserId) -> Seed::User::Types::User</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```ruby
client.organizations.get_organization_user({
  organizationId:'organization_id',
  userId:'user_id'
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

**tenantId:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**organizationId:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**userId:** `String` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.Organizations.SearchOrganizations(TenantId, OrganizationId) -> Internal::Types::Array[Seed::Organizations::Types::Organization]</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```ruby
client.organizations.search_organizations({
  organizationId:'organization_id',
  limit:1
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

**tenantId:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**organizationId:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**limit:** `Integer` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## User
<details><summary><code>client.User.GetUser(TenantId, UserId) -> Seed::User::Types::User</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```ruby
client.user.get_user({
  userId:'user_id'
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

**tenantId:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**userId:** `String` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.User.CreateUser(TenantId, request) -> Seed::User::Types::User</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```ruby
client.user.create_user({
  name:'name',
  tags:['tags', 'tags']
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

**tenantId:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**request:** `Seed::User::Types::User` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.User.UpdateUser(TenantId, UserId, request) -> Seed::User::Types::User</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```ruby
client.user.update_user({
  userId:'user_id'
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

**tenantId:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**userId:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**request:** `Seed::User::Types::User` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.User.SearchUsers(TenantId, UserId) -> Internal::Types::Array[Seed::User::Types::User]</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```ruby
client.user.search_users({
  userId:'user_id',
  limit:1
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

**tenantId:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**userId:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**limit:** `Integer` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>
