# Reference
## Organization
<details><summary><code>$client-><a href="/Seed/Organization/OrganizationClient.php">create</a>($request) -> \Seed\Organization\Types\Organization</code></summary>
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

```php
$client->organization->create(
    $request,
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

**$request:** `\Seed\Organization\Types\CreateOrganizationRequest` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## User
<details><summary><code>$client-><a href="/Seed/User/UserClient.php">list</a>($request) -> array</code></summary>
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

```php
$client->user->list(
    $request,
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

**$request:** `\Seed\User\Requests\ListUsersRequest` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## User Events
<details><summary><code>$client-><a href="/Seed/User/Events/EventsClient.php">listEvents</a>($request) -> array</code></summary>
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

```php
$client->user->events->listEvents(
    $request,
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

**$request:** `\Seed\User\Events\Requests\ListUserEventsRequest` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## User Events Metadata
<details><summary><code>$client-><a href="/Seed/User/Events/Metadata/MetadataClient.php">getMetadata</a>($request) -> \Seed\User\Events\Metadata\Types\Metadata</code></summary>
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

```php
$client->user->events->metadata->getMetadata(
    $request,
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

**$request:** `\Seed\User\Events\Metadata\Requests\GetEventMetadataRequest` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>
