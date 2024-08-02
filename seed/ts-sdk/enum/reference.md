# Reference

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
    operand: SeedEnum.Operand.GreaterThan,
    operandOrColor: SeedEnum.Color.Red,
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

**requestOptions:** `InlinedRequest.RequestOptions`

</dd>
</dl>
</dd>
</dl>

</dd>
</dl>
</details>

## PathParam

<details><summary><code>client.pathParam.<a href="/src/api/resources/pathParam/client/Client.ts">send</a>(operand, maybeOperand, operandOrColor, maybeOperandOrColor) -> void</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.pathParam.send(
    SeedEnum.Operand.GreaterThan,
    SeedEnum.Operand.LessThan,
    SeedEnum.Color.Red,
    SeedEnum.Color.Red
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

**operand:** `SeedEnum.Operand`

</dd>
</dl>

<dl>
<dd>

**maybeOperand:** `SeedEnum.Operand | undefined`

</dd>
</dl>

<dl>
<dd>

**operandOrColor:** `SeedEnum.ColorOrOperand`

</dd>
</dl>

<dl>
<dd>

**maybeOperandOrColor:** `SeedEnum.ColorOrOperand | undefined`

</dd>
</dl>

<dl>
<dd>

**requestOptions:** `PathParam.RequestOptions`

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
    operand: SeedEnum.Operand.GreaterThan,
    operandOrColor: SeedEnum.Color.Red,
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

**requestOptions:** `QueryParam.RequestOptions`

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
    operand: SeedEnum.Operand.GreaterThan,
    maybeOperand: SeedEnum.Operand.GreaterThan,
    operandOrColor: SeedEnum.Color.Red,
    maybeOperandOrColor: SeedEnum.Color.Red,
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

**requestOptions:** `QueryParam.RequestOptions`

</dd>
</dl>
</dd>
</dl>

</dd>
</dl>
</details>
