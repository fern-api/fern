# Reference
## Headers
<details><summary><code>client.Headers.<a href="/src/SeedEnum/Headers/HeadersClient.cs">SendAsync</a>(SendEnumAsHeaderRequest { ... })</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
await client.Headers.SendAsync(
    new SendEnumAsHeaderRequest
    {
        Operand = Operand.GreaterThan,
        MaybeOperand = Operand.GreaterThan,
        OperandOrColor = Color.Red,
        MaybeOperandOrColor = null,
    }
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

**request:** `SendEnumAsHeaderRequest` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## InlinedRequest
<details><summary><code>client.InlinedRequest.<a href="/src/SeedEnum/InlinedRequest/InlinedRequestClient.cs">SendAsync</a>(SendEnumInlinedRequest { ... })</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
await client.InlinedRequest.SendAsync(
    new SendEnumInlinedRequest { Operand = Operand.GreaterThan, OperandOrColor = Color.Red }
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

**request:** `SendEnumInlinedRequest` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## PathParam
<details><summary><code>client.PathParam.<a href="/src/SeedEnum/PathParam/PathParamClient.cs">SendAsync</a>(operand, operandOrColor)</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
await client.PathParam.SendAsync(Operand.GreaterThan, Color.Red);
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

**operandOrColor:** `OneOf<Color, Operand>` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## QueryParam
<details><summary><code>client.QueryParam.<a href="/src/SeedEnum/QueryParam/QueryParamClient.cs">SendAsync</a>(SendEnumAsQueryParamRequest { ... })</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
await client.QueryParam.SendAsync(
    new SendEnumAsQueryParamRequest { Operand = Operand.GreaterThan, OperandOrColor = Color.Red }
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

**request:** `SendEnumAsQueryParamRequest` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.QueryParam.<a href="/src/SeedEnum/QueryParam/QueryParamClient.cs">SendListAsync</a>(SendEnumListAsQueryParamRequest { ... })</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
await client.QueryParam.SendListAsync(
    new SendEnumListAsQueryParamRequest
    {
        Operand = [Operand.GreaterThan],
        MaybeOperand = [Operand.GreaterThan],
        OperandOrColor = [Color.Red],
        MaybeOperandOrColor = [Color.Red],
    }
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

**request:** `SendEnumListAsQueryParamRequest` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>
