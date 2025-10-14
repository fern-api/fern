# Reference
## Organization
<details><summary><code>client.organization.<a href="/src/api/resources/organization/client/Client.ts">create</a>({ ...params }) -> SeedMixedFileDirectory.Organization</code></summary>
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

```typescript
await client.organization.create({
    name: "name"
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

**request:** `SeedMixedFileDirectory.CreateOrganizationRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `Organization.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## User
<details><summary><code>client.user.<a href="/src/api/resources/user/client/Client.ts">list</a>({ ...params }) -> SeedMixedFileDirectory.User[]</code></summary>
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

```typescript
await client.user.list({
    limit: 1
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

**request:** `SeedMixedFileDirectory.ListUsersRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `User.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## User Events
<details><summary><code>client.user.events.<a href="/src/api/resources/user/resources/events/client/Client.ts">listEvents</a>({ ...params }) -> SeedMixedFileDirectory.Event[]</code></summary>
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

```typescript
await client.user.events.listEvents({
    limit: 1
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

**request:** `SeedMixedFileDirectory.user.ListUserEventsRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `Events.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## User Events Metadata
<details><summary><code>client.user.events.metadata.<a href="/src/api/resources/user/resources/events/resources/metadata/client/Client.ts">getMetadata</a>({ ...params }) -> SeedMixedFileDirectory.Metadata</code></summary>
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

```typescript
await client.user.events.metadata.getMetadata({
    id: "id"
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

**request:** `SeedMixedFileDirectory.user.events.GetEventMetadataRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `Metadata.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>
