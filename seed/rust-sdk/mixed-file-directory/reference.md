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
use seed_api::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        ..Default::default()
    };
    let client = ApiClient::new(config).expect("Failed to build client");
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

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**name:** `String` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## User
<details><summary><code>client.user.<a href="/src/api/resources/user/client.rs">list</a>(limit: Option&lt;Option&lt;Option&lt;i64&gt;&gt;&gt;) -> Result&lt;Vec&lt;User&gt;, ApiError&gt;</code></summary>
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
use seed_api::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        ..Default::default()
    };
    let client = ApiClient::new(config).expect("Failed to build client");
    client
        .user
        .list(
            &ListQueryRequest {
                ..Default::default()
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

**limit:** `Option<Option<i64>>` — The maximum number of results to return.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## UserEvents
<details><summary><code>client.user_events.<a href="/src/api/resources/user_events/client.rs">user_events_list_events</a>(limit: Option&lt;Option&lt;Option&lt;i64&gt;&gt;&gt;) -> Result&lt;Vec&lt;UserEvent&gt;, ApiError&gt;</code></summary>
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
use seed_api::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        ..Default::default()
    };
    let client = ApiClient::new(config).expect("Failed to build client");
    client
        .user_events
        .user_events_list_events(
            &UserEventsListEventsQueryRequest {
                ..Default::default()
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

**limit:** `Option<Option<i64>>` — The maximum number of results to return.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## UserEventsMetadata
<details><summary><code>client.user_events_metadata.<a href="/src/api/resources/user_events_metadata/client.rs">user_events_metadata_get_metadata</a>(id: Option&lt;Id&gt;) -> Result&lt;UsereventsMetadata, ApiError&gt;</code></summary>
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
use seed_api::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        ..Default::default()
    };
    let client = ApiClient::new(config).expect("Failed to build client");
    client
        .user_events_metadata
        .user_events_metadata_get_metadata(
            &UserEventsMetadataGetMetadataQueryRequest {
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

