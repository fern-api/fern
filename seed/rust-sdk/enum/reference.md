# Reference
## Headers
<details><summary><code>client.headers.<a href="/src/api/resources/headers/client.rs">send</a>() -> Result&lt;(), ApiError&gt;</code></summary>
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
        .send(Some(
            RequestOptions::new()
                .additional_header("operand", ">")
                .additional_header("operandOrColor", "red"),
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

## Inlinedrequest
<details><summary><code>client.inlinedrequest.<a href="/src/api/resources/inlinedrequest/client.rs">send</a>(request: InlinedRequestSendRequest) -> Result&lt;(), ApiError&gt;</code></summary>
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
        .inlinedrequest
        .send(
            &InlinedRequestSendRequest {
                operand: Operand::GreaterThan,
                operand_or_color: ColorOrOperand::Color(Color::Red),
                maybe_operand: None,
                maybe_operand_or_color: None,
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

## Multipartform
<details><summary><code>client.multipartform.<a href="/src/api/resources/multipartform/client.rs">multipartform</a>() -> Result&lt;(), ApiError&gt;</code></summary>
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
        .multipartform
        .multipartform(
            &MultipartformRequest {
                color: None,
                maybe_color: None,
                color_list: None,
                maybe_color_list: None,
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

## Pathparam
<details><summary><code>client.pathparam.<a href="/src/api/resources/pathparam/client.rs">send</a>(operand: Operand, operand_or_color: ColorOrOperand) -> Result&lt;(), ApiError&gt;</code></summary>
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
        .pathparam
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

## Queryparam
<details><summary><code>client.queryparam.<a href="/src/api/resources/queryparam/client.rs">send</a>(operand: Option&lt;Operand&gt;, maybe_operand: Option&lt;Option&lt;Operand&gt;&gt;, operand_or_color: Option&lt;Color&gt;, maybe_operand_or_color: Option&lt;Option&lt;ColorOrOperand&gt;&gt;) -> Result&lt;(), ApiError&gt;</code></summary>
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
        .queryparam
        .send(
            &SendQueryRequest {
                operand: Operand::GreaterThan,
                operand_or_color: Color::Red,
                maybe_operand: None,
                maybe_operand_or_color: None,
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

**operand_or_color:** `Color` 
    
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

<details><summary><code>client.queryparam.<a href="/src/api/resources/queryparam/client.rs">sendlist</a>() -> Result&lt;(), ApiError&gt;</code></summary>
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
        .queryparam
        .sendlist(
            &SendlistQueryRequest {
                operand: vec![Some(Operand::GreaterThan)],
                maybe_operand: vec![Some(Operand::GreaterThan)],
                operand_or_color: vec![Some(ColorOrOperand::Color(Color::Red))],
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

**operand:** `Option<Operand>` 
    
</dd>
</dl>

<dl>
<dd>

**maybe_operand:** `Option<Operand>` 
    
</dd>
</dl>

<dl>
<dd>

**operand_or_color:** `Option<ColorOrOperand>` 
    
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

