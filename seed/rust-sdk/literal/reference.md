# Reference
## Headers
<details><summary><code>client.headers.<a href="/src/api/resources/headers/client.rs">send</a>(request: SendLiteralsInHeadersRequest) -> Result&lt;SendResponse, ApiError&gt;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```rust
use seed_literal::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        ..Default::default()
    };
    let client = LiteralClient::new(config).expect("Failed to build client");
    client
        .headers
        .send(
            &SendLiteralsInHeadersRequest {
                query: "What is the weather today".to_string(),
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
<details><summary><code>client.inlined.<a href="/src/api/resources/inlined/client.rs">send</a>(request: SendLiteralsInlinedRequest) -> Result&lt;SendResponse, ApiError&gt;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```rust
use seed_literal::prelude::*;
use seed_literal::{ANestedLiteral, ATopLevelLiteral, SomeAliasedLiteral};

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        ..Default::default()
    };
    let client = LiteralClient::new(config).expect("Failed to build client");
    client
        .inlined
        .send(
            &SendLiteralsInlinedRequest {
                prompt: "You are a helpful assistant".to_string(),
                context: Some("You're super wise".to_string()),
                query: "What is the weather today".to_string(),
                temperature: Some(10.1),
                stream: false,
                aliased_context: SomeAliasedLiteral("You're super wise".to_string()),
                maybe_context: Some(SomeAliasedLiteral("You're super wise".to_string())),
                object_with_literal: ATopLevelLiteral {
                    nested_literal: ANestedLiteral {
                        my_literal: "How super cool".to_string(),
                    },
                },
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

**prompt:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**context:** `Option<String>` 
    
</dd>
</dl>

<dl>
<dd>

**query:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**temperature:** `Option<f64>` 
    
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
<details><summary><code>client.path.<a href="/src/api/resources/path/client.rs">send</a>(id: String) -> Result&lt;SendResponse, ApiError&gt;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```rust
use seed_literal::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        ..Default::default()
    };
    let client = LiteralClient::new(config).expect("Failed to build client");
    client.path.send(&"123".to_string(), None).await;
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

**id:** `String` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## Query
<details><summary><code>client.query.<a href="/src/api/resources/query/client.rs">send</a>(prompt: Option&lt;String&gt;, optional_prompt: Option&lt;Option&lt;String&gt;&gt;, alias_prompt: Option&lt;AliasToPrompt&gt;, alias_optional_prompt: Option&lt;Option&lt;AliasToPrompt&gt;&gt;, query: Option&lt;String&gt;, stream: Option&lt;bool&gt;, optional_stream: Option&lt;Option&lt;bool&gt;&gt;, alias_stream: Option&lt;AliasToStream&gt;, alias_optional_stream: Option&lt;Option&lt;AliasToStream&gt;&gt;) -> Result&lt;SendResponse, ApiError&gt;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```rust
use seed_literal::prelude::*;
use seed_literal::{AliasToPrompt, AliasToStream};

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        ..Default::default()
    };
    let client = LiteralClient::new(config).expect("Failed to build client");
    client
        .query
        .send(
            &SendQueryRequest {
                prompt: "You are a helpful assistant".to_string(),
                optional_prompt: Some("You are a helpful assistant".to_string()),
                alias_prompt: AliasToPrompt("You are a helpful assistant".to_string()),
                alias_optional_prompt: Some(AliasToPrompt(
                    "You are a helpful assistant".to_string(),
                )),
                stream: false,
                optional_stream: Some(false),
                alias_stream: AliasToStream(false),
                alias_optional_stream: Some(AliasToStream(false)),
                query: "What is the weather today".to_string(),
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

**prompt:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**optional_prompt:** `Option<String>` 
    
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

**optional_stream:** `Option<bool>` 
    
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
use seed_literal::prelude::*;
use seed_literal::{ContainerObject, NestedObjectWithLiterals, SendRequest, SomeLiteral};

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        ..Default::default()
    };
    let client = LiteralClient::new(config).expect("Failed to build client");
    client
        .reference
        .send(
            &SendRequest {
                prompt: "You are a helpful assistant".to_string(),
                query: "What is the weather today".to_string(),
                stream: false,
                ending: Default::default(),
                context: SomeLiteral("You're super wise".to_string()),
                maybe_context: None,
                container_object: ContainerObject {
                    nested_objects: vec![NestedObjectWithLiterals {
                        literal_1: "literal1".to_string(),
                        literal_2: "literal2".to_string(),
                        str_prop: "strProp".to_string(),
                    }],
                },
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
