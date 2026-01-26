# Reference
## Headers
<details><summary><code>client.headers.<a href="/src/api/resources/headers/client/Client.ts">send</a>({ ...params }) -> void</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.headers.send({
    operand: ">",
    maybeOperand: ">",
    operandOrColor: "red",
    maybeOperandOrColor: undefined
});

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

**request:** `SeedEnum.SendEnumAsHeaderRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `HeadersClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## InlinedRequest
<details><summary><code>client.inlinedRequest.<a href="/src/api/resources/inlinedRequest/client/Client.ts">send</a>({ ...params }) -> void</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.inlinedRequest.send({
    operand: ">",
    operandOrColor: "red"
});

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

**request:** `SeedEnum.SendEnumInlinedRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `InlinedRequestClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## MultipartForm
## PathParam
<details><summary><code>client.pathParam.<a href="/src/api/resources/pathParam/client/Client.ts">send</a>(operand, operandOrColor) -> void</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.pathParam.send(">", "red");

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

**operand:** `SeedEnum.Operand` 
    
</dd>
</dl>

<dl>
<dd>

**operandOrColor:** `SeedEnum.ColorOrOperand` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `PathParamClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## QueryParam
<details><summary><code>client.queryParam.<a href="/src/api/resources/queryParam/client/Client.ts">send</a>({ ...params }) -> void</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.queryParam.send({
    operand: ">",
    operandOrColor: "red"
});

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

**request:** `SeedEnum.SendEnumAsQueryParamRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `QueryParamClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.queryParam.<a href="/src/api/resources/queryParam/client/Client.ts">sendList</a>({ ...params }) -> void</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.queryParam.sendList({
    operand: ">",
    maybeOperand: ">",
    operandOrColor: "red",
    maybeOperandOrColor: "red"
});

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

**request:** `SeedEnum.SendEnumListAsQueryParamRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `QueryParamClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>
