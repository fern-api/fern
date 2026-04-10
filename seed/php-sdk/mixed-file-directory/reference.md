# Reference
## Organization
<details><summary><code>$client-&gt;organization-&gt;create($request) -> ?Organization</code></summary>
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
    new CreateOrganizationRequest([
        'name' => 'name',
    ]),
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

**$name:** `string` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## User
<details><summary><code>$client-&gt;user-&gt;list($request) -> ?array</code></summary>
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
    new UserListRequest([]),
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

**$limit:** `?int` — The maximum number of results to return.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## UserEvents
<details><summary><code>$client-&gt;userEvents-&gt;userEventsListEvents($request) -> ?array</code></summary>
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
$client->userEvents->userEventsListEvents(
    new UserEventsListEventsRequest([]),
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

**$limit:** `?int` — The maximum number of results to return.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## UserEventsMetadata
<details><summary><code>$client-&gt;userEventsMetadata-&gt;userEventsMetadataGetMetadata($request) -> ?UsereventsMetadata</code></summary>
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
$client->userEventsMetadata->userEventsMetadataGetMetadata(
    new UserEventsMetadataGetMetadataRequest([
        'id' => 'id',
    ]),
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

**$id:** `string` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

