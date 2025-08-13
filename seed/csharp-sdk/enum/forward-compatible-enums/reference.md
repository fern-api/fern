# Reference
## Headers
<details><summary><code>client.Headers.<a href="/src/SeedEnum/Headers/HeadersClient.cs">SendAsync</a>(SeedEnum.SendEnumAsHeaderRequest { ... })</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
await client.Headers.SendAsync(
    new SeedEnum.SendEnumAsHeaderRequest
    {
        Operand = SeedEnum.Operand.GreaterThan,
        MaybeOperand = SeedEnum.Operand.GreaterThan,
        OperandOrColor = SeedEnum.Color.Red,
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

**request:** `SeedEnum.SendEnumAsHeaderRequest` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## InlinedRequest
<details><summary><code>client.InlinedRequest.<a href="/src/SeedEnum/InlinedRequest/InlinedRequestClient.cs">SendAsync</a>(SeedEnum.SendEnumInlinedRequest { ... })</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
await client.InlinedRequest.SendAsync(
    new SeedEnum.SendEnumInlinedRequest
    {
        Operand = SeedEnum.Operand.GreaterThan,
        OperandOrColor = SeedEnum.Color.Red,
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

**request:** `SeedEnum.SendEnumInlinedRequest` 
    
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
await client.PathParam.SendAsync(SeedEnum.Operand.GreaterThan, SeedEnum.Color.Red);
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

**operandOrColor:** `OneOf<SeedEnum.Color, SeedEnum.Operand>` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## QueryParam
<details><summary><code>client.QueryParam.<a href="/src/SeedEnum/QueryParam/QueryParamClient.cs">SendAsync</a>(SeedEnum.SendEnumAsQueryParamRequest { ... })</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
await client.QueryParam.SendAsync(
    new SeedEnum.SendEnumAsQueryParamRequest
    {
        Operand = SeedEnum.Operand.GreaterThan,
        OperandOrColor = SeedEnum.Color.Red,
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

**request:** `SeedEnum.SendEnumAsQueryParamRequest` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.QueryParam.<a href="/src/SeedEnum/QueryParam/QueryParamClient.cs">SendListAsync</a>(SeedEnum.SendEnumListAsQueryParamRequest { ... })</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
await client.QueryParam.SendListAsync(
    new SeedEnum.SendEnumListAsQueryParamRequest
    {
        Operand = [SeedEnum.Operand.GreaterThan],
        MaybeOperand = [SeedEnum.Operand.GreaterThan],
        OperandOrColor = [SeedEnum.Color.Red],
        MaybeOperandOrColor = [SeedEnum.Color.Red],
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

**request:** `SeedEnum.SendEnumListAsQueryParamRequest` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>
