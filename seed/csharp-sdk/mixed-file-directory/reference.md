# Reference
## Organization
<details><summary><code>client.Organization.<a href="/src/SeedMixedFileDirectory/Organization/OrganizationClient.cs">CreateAsync</a>(SeedMixedFileDirectory.CreateOrganizationRequest { ... }) -> SeedMixedFileDirectory.Organization</code></summary>
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

```csharp
await client.Organization.CreateAsync(
    new SeedMixedFileDirectory.CreateOrganizationRequest { Name = "name" }
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

**request:** `SeedMixedFileDirectory.CreateOrganizationRequest` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## User
<details><summary><code>client.User.<a href="/src/SeedMixedFileDirectory/User/UserClient.cs">ListAsync</a>(SeedMixedFileDirectory.ListUsersRequest { ... }) -> IEnumerable<SeedMixedFileDirectory.User></code></summary>
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

```csharp
await client.User.ListAsync(new SeedMixedFileDirectory.ListUsersRequest { Limit = 1 });
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
</dd>
</dl>


</dd>
</dl>
</details>

## User Events
<details><summary><code>client.User.Events.<a href="/src/SeedMixedFileDirectory/User/Events/EventsClient.cs">ListEventsAsync</a>(SeedMixedFileDirectory.User.ListUserEventsRequest { ... }) -> IEnumerable<SeedMixedFileDirectory.User.Event></code></summary>
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

```csharp
await client.User.Events.ListEventsAsync(
    new SeedMixedFileDirectory.User.ListUserEventsRequest { Limit = 1 }
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

**request:** `SeedMixedFileDirectory.User.ListUserEventsRequest` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## User Events Metadata
<details><summary><code>client.User.Events.Metadata.<a href="/src/SeedMixedFileDirectory/User/Events/Metadata/MetadataClient.cs">GetMetadataAsync</a>(SeedMixedFileDirectory.User.Events.GetEventMetadataRequest { ... }) -> SeedMixedFileDirectory.User.Events.Metadata</code></summary>
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

```csharp
await client.User.Events.Metadata.GetMetadataAsync(
    new SeedMixedFileDirectory.User.Events.GetEventMetadataRequest { Id = "id" }
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

**request:** `SeedMixedFileDirectory.User.Events.GetEventMetadataRequest` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>
