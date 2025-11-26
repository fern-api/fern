# Reference
## Headers
<details><summary><code>client.headers.<a href="/src/api/resources/headers/client.rs">send</a>() -> Result<(), ApiError></code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```rust
use seed_enum::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        ..Default::default()
    };
    let client = EnumClient::new(config).expect("Failed to build client");
    client
        .headers
        .send(Some(
            RequestOptions::new()
                .additional_header("operand", Operand::GreaterThan)
                .additional_header("maybeOperand", Some(Operand::GreaterThan))
                .additional_header("operandOrColor", ColorOrOperand::Color(Color::Red)),
        ))
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

## InlinedRequest
<details><summary><code>client.inlined_request.<a href="/src/api/resources/inlined_request/client.rs">send</a>(request: SendEnumInlinedRequest) -> Result<(), ApiError></code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```rust
use seed_enum::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        ..Default::default()
    };
    let client = EnumClient::new(config).expect("Failed to build client");
    client
        .inlined_request
        .send(
            &SendEnumInlinedRequest {
                operand: Operand::GreaterThan,
                operand_or_color: ColorOrOperand::Color(Color::Red),
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

**operand:** `Operand` 
    
</dd>
</dl>

<dl>
<dd>

**maybe_operand:** `Option<Operand>` 
    
</dd>
</dl>

<dl>
<dd>

**operand_or_color:** `ColorOrOperand` 
    
</dd>
</dl>

<dl>
<dd>

**maybe_operand_or_color:** `Option<ColorOrOperand>` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## MultipartForm
## PathParam
<details><summary><code>client.path_param.<a href="/src/api/resources/path_param/client.rs">send</a>(operand: Operand, operand_or_color: ColorOrOperand) -> Result<(), ApiError></code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```rust
use seed_enum::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        ..Default::default()
    };
    let client = EnumClient::new(config).expect("Failed to build client");
    client
        .path_param
        .send(
            &Operand::GreaterThan,
            &ColorOrOperand::Color(Color::Red),
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

**operand:** `Operand` 
    
</dd>
</dl>

<dl>
<dd>

**operand_or_color:** `ColorOrOperand` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## QueryParam
<details><summary><code>client.query_param.<a href="/src/api/resources/query_param/client.rs">send</a>(operand: Option<Operand>, maybe_operand: Option<Option<Operand>>, operand_or_color: Option<ColorOrOperand>, maybe_operand_or_color: Option<Option<ColorOrOperand>>) -> Result<(), ApiError></code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```rust
use seed_enum::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        ..Default::default()
    };
    let client = EnumClient::new(config).expect("Failed to build client");
    client
        .query_param
        .send(
            &SendQueryRequest {
                operand: Operand::GreaterThan,
                operand_or_color: ColorOrOperand::Color(Color::Red),
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

**operand:** `Operand` 
    
</dd>
</dl>

<dl>
<dd>

**maybe_operand:** `Option<Operand>` 
    
</dd>
</dl>

<dl>
<dd>

**operand_or_color:** `ColorOrOperand` 
    
</dd>
</dl>

<dl>
<dd>

**maybe_operand_or_color:** `Option<ColorOrOperand>` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.query_param.<a href="/src/api/resources/query_param/client.rs">send_list</a>() -> Result<(), ApiError></code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```rust
use seed_enum::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        ..Default::default()
    };
    let client = EnumClient::new(config).expect("Failed to build client");
    client
        .query_param
        .send_list(
            &SendListQueryRequest {
                operand: vec![Operand::GreaterThan],
                maybe_operand: vec![Some(Operand::GreaterThan)],
                operand_or_color: vec![ColorOrOperand::Color(Color::Red)],
                maybe_operand_or_color: vec![Some(ColorOrOperand::Color(Color::Red))],
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

**operand:** `Operand` 
    
</dd>
</dl>

<dl>
<dd>

**maybe_operand:** `Option<Operand>` 
    
</dd>
</dl>

<dl>
<dd>

**operand_or_color:** `ColorOrOperand` 
    
</dd>
</dl>

<dl>
<dd>

**maybe_operand_or_color:** `Option<ColorOrOperand>` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>
