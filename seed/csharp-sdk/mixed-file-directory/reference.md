# Reference
## Organization
<details><summary><code>client.Organization.<a href="/src/SeedApi/Organization/OrganizationClient.cs">CreateAsync</a>(CreateOrganizationRequest { ... }) -> WithRawResponseTask&lt;Organization&gt;</code></summary>
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
await client.Organization.CreateAsync(new CreateOrganizationRequest { Name = "name" });
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

**request:** `CreateOrganizationRequest` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## User
<details><summary><code>client.User.<a href="/src/SeedApi/User/UserClient.cs">ListAsync</a>(UserListRequest { ... }) -> WithRawResponseTask&lt;IEnumerable&lt;User&gt;&gt;</code></summary>
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
await client.User.ListAsync(new UserListRequest());
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

**request:** `UserListRequest` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## UserEvents
<details><summary><code>client.UserEvents.<a href="/src/SeedApi/UserEvents/UserEventsClient.cs">UserEventsListEventsAsync</a>(UserEventsListEventsRequest { ... }) -> WithRawResponseTask&lt;IEnumerable&lt;UserEvent&gt;&gt;</code></summary>
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
await client.UserEvents.UserEventsListEventsAsync(new UserEventsListEventsRequest());
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

**request:** `UserEventsListEventsRequest` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## UserEventsMetadata
<details><summary><code>client.UserEventsMetadata.<a href="/src/SeedApi/UserEventsMetadata/UserEventsMetadataClient.cs">UserEventsMetadataGetMetadataAsync</a>(UserEventsMetadataGetMetadataRequest { ... }) -> WithRawResponseTask&lt;UsereventsMetadata&gt;</code></summary>
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
await client.UserEventsMetadata.UserEventsMetadataGetMetadataAsync(
    new UserEventsMetadataGetMetadataRequest { Id = "id" }
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

**request:** `UserEventsMetadataGetMetadataRequest` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

