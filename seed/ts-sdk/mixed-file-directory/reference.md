# Reference
## Organization
<details><summary><code>client.organization.<a href="/src/api/resources/organization/client/Client.ts">create</a>({ ...params }) -> SeedApi.Organization</code></summary>
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

**request:** `SeedApi.CreateOrganizationRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `OrganizationClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## User
<details><summary><code>client.user.<a href="/src/api/resources/user/client/Client.ts">list</a>({ ...params }) -> SeedApi.User[]</code></summary>
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
await client.user.list();

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

**request:** `SeedApi.UserListRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `UserClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## UserEvents
<details><summary><code>client.userEvents.<a href="/src/api/resources/userEvents/client/Client.ts">userEventsListEvents</a>({ ...params }) -> SeedApi.UserEvent[]</code></summary>
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
await client.userEvents.userEventsListEvents();

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

**request:** `SeedApi.UserEventsListEventsRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `UserEventsClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## UserEventsMetadata
<details><summary><code>client.userEventsMetadata.<a href="/src/api/resources/userEventsMetadata/client/Client.ts">userEventsMetadataGetMetadata</a>({ ...params }) -> SeedApi.UsereventsMetadata</code></summary>
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
await client.userEventsMetadata.userEventsMetadataGetMetadata({
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

**request:** `SeedApi.UserEventsMetadataGetMetadataRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `UserEventsMetadataClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

