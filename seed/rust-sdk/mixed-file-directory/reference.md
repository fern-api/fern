# Reference
## Organization
<details><summary><code>client.organization.<a href="/src/api/resources/organization/client.rs">create</a>(request: CreateOrganizationRequest) -> Result&lt;Organization, ApiError&gt;</code></summary>
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

```rust
use seed_mixed_file_directory::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        ..Default::default()
    };
    let client = MixedFileDirectoryClient::new(config).expect("Failed to build client");
    client
        .organization
        .create(
            &CreateOrganizationRequest {
                name: "name".to_string(),
            },
            None,
        )
        .await;
}
```
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## User
<details><summary><code>client.user.<a href="/src/api/resources/user/client.rs">list</a>(limit: Option&lt;Option&lt;i64&gt;&gt;) -> Result&lt;Vec&lt;User&gt;, ApiError&gt;</code></summary>
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

```rust
use seed_mixed_file_directory::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        ..Default::default()
    };
    let client = MixedFileDirectoryClient::new(config).expect("Failed to build client");
    client
        .user
        .list(&ListQueryRequest { limit: Some(1) }, None)
        .await;
}
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

**limit:** `Option<i64>` — The maximum number of results to return.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## User Events
<details><summary><code>client.user().events.<a href="/src/api/resources/user/events/client.rs">list_events</a>(limit: Option&lt;Option&lt;i64&gt;&gt;) -> Result&lt;Vec&lt;Event&gt;, ApiError&gt;</code></summary>
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

```rust
use seed_mixed_file_directory::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        ..Default::default()
    };
    let client = MixedFileDirectoryClient::new(config).expect("Failed to build client");
    client
        .user
        .events
        .list_events(&ListEventsQueryRequest { limit: Some(1) }, None)
        .await;
}
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

**limit:** `Option<i64>` — The maximum number of results to return.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## User Events Metadata
<details><summary><code>client.user().events().metadata.<a href="/src/api/resources/user/events/metadata/client.rs">get_metadata</a>(id: Option&lt;Id&gt;) -> Result&lt;Metadata, ApiError&gt;</code></summary>
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

```rust
use seed_mixed_file_directory::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        ..Default::default()
    };
    let client = MixedFileDirectoryClient::new(config).expect("Failed to build client");
    client
        .user
        .events
        .metadata
        .get_metadata(
            &GetMetadataQueryRequest {
                id: Id("id".to_string()),
            },
            None,
        )
        .await;
}
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

**id:** `Id` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>
