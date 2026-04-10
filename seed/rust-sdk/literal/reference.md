# Reference
## Headers
<details><summary><code>client.headers.<a href="/src/api/resources/headers/client.rs">send</a>(request: HeadersSendRequest) -> Result&lt;SendResponse, ApiError&gt;</code></summary>
<dl>
<dd>

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
        .headers
        .send(
            &HeadersSendRequest {
                query: "query".to_string(),
            },
            Some(
                RequestOptions::new()
                    .additional_header("X-Endpoint-Version", "02-12-2024")
                    .additional_header("X-Async", "true"),
            ),
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

**query:** `String` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## Inlined
<details><summary><code>client.inlined.<a href="/src/api/resources/inlined/client.rs">send</a>(request: InlinedSendRequest) -> Result&lt;SendResponse, ApiError&gt;</code></summary>
<dl>
<dd>

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
        .inlined
        .send(
            &InlinedSendRequest {
                prompt: InlinedSendRequestPrompt::YouAreAHelpfulAssistant,
                query: "query".to_string(),
                stream: true,
                aliased_context: SomeAliasedLiteral::YoureSuperWise,
                object_with_literal: ATopLevelLiteral {
                    nested_literal: ANestedLiteral {
                        my_literal: ANestedLiteralMyLiteral::HowSuperCool,
                    },
                },
                context: None,
                temperature: None,
                maybe_context: None,
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

**prompt:** `InlinedSendRequestPrompt` 
    
</dd>
</dl>

<dl>
<dd>

**context:** `Option<Option<InlinedSendRequestContext>>` 
    
</dd>
</dl>

<dl>
<dd>

**query:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**temperature:** `Option<Option<f64>>` 
    
</dd>
</dl>

<dl>
<dd>

**stream:** `bool` 
    
</dd>
</dl>

<dl>
<dd>

**aliased_context:** `SomeAliasedLiteral` 
    
</dd>
</dl>

<dl>
<dd>

**maybe_context:** `Option<SomeAliasedLiteral>` 
    
</dd>
</dl>

<dl>
<dd>

**object_with_literal:** `ATopLevelLiteral` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## Path
<details><summary><code>client.path.<a href="/src/api/resources/path/client.rs">send</a>(id: PathSendRequestId) -> Result&lt;SendResponse, ApiError&gt;</code></summary>
<dl>
<dd>

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
        .path
        .send(&PathSendRequestId::OneHundredTwentyThree, None)
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

**id:** `PathSendRequestId` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## Query
<details><summary><code>client.query.<a href="/src/api/resources/query/client.rs">send</a>(prompt: Option&lt;QuerySendRequestPrompt&gt;, optional_prompt: Option&lt;Option&lt;Option&lt;QuerySendRequestOptionalPrompt&gt;&gt;&gt;, alias_prompt: Option&lt;AliasToPrompt&gt;, alias_optional_prompt: Option&lt;Option&lt;AliasToPrompt&gt;&gt;, query: Option&lt;String&gt;, stream: Option&lt;bool&gt;, optional_stream: Option&lt;Option&lt;Option&lt;bool&gt;&gt;&gt;, alias_stream: Option&lt;AliasToStream&gt;, alias_optional_stream: Option&lt;Option&lt;AliasToStream&gt;&gt;) -> Result&lt;SendResponse, ApiError&gt;</code></summary>
<dl>
<dd>

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
        .query
        .send(
            &SendQueryRequest {
                prompt: QuerySendRequestPrompt::YouAreAHelpfulAssistant,
                alias_prompt: AliasToPrompt::YouAreAHelpfulAssistant,
                query: "query".to_string(),
                stream: true,
                alias_stream: AliasToStream(true),
                optional_prompt: None,
                alias_optional_prompt: None,
                optional_stream: None,
                alias_optional_stream: None,
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

**prompt:** `QuerySendRequestPrompt` 
    
</dd>
</dl>

<dl>
<dd>

**optional_prompt:** `Option<Option<QuerySendRequestOptionalPrompt>>` 
    
</dd>
</dl>

<dl>
<dd>

**alias_prompt:** `AliasToPrompt` 
    
</dd>
</dl>

<dl>
<dd>

**alias_optional_prompt:** `Option<AliasToPrompt>` 
    
</dd>
</dl>

<dl>
<dd>

**query:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**stream:** `bool` 
    
</dd>
</dl>

<dl>
<dd>

**optional_stream:** `Option<Option<bool>>` 
    
</dd>
</dl>

<dl>
<dd>

**alias_stream:** `AliasToStream` 
    
</dd>
</dl>

<dl>
<dd>

**alias_optional_stream:** `Option<AliasToStream>` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## Reference
<details><summary><code>client.reference.<a href="/src/api/resources/reference/client.rs">send</a>(request: SendRequest) -> Result&lt;SendResponse, ApiError&gt;</code></summary>
<dl>
<dd>

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
        .reference
        .send(
            &SendRequest {
                prompt: SendRequestPrompt::YouAreAHelpfulAssistant,
                query: "query".to_string(),
                stream: true,
                ending: SendRequestEnding::Ending,
                context: SomeLiteral::YoureSuperWise,
                container_object: ContainerObject {
                    nested_objects: vec![NestedObjectWithLiterals {
                        literal1: NestedObjectWithLiteralsLiteral1::Literal1,
                        literal2: NestedObjectWithLiteralsLiteral2::Literal2,
                        str_prop: "strProp".to_string(),
                    }],
                    ..Default::default()
                },
                maybe_context: None,
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

**prompt:** `SendRequestPrompt` 
    
</dd>
</dl>

<dl>
<dd>

**query:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**stream:** `bool` 
    
</dd>
</dl>

<dl>
<dd>

**ending:** `SendRequestEnding` 
    
</dd>
</dl>

<dl>
<dd>

**context:** `SomeLiteral` 
    
</dd>
</dl>

<dl>
<dd>

**maybe_context:** `Option<SomeLiteral>` 
    
</dd>
</dl>

<dl>
<dd>

**container_object:** `ContainerObject` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

