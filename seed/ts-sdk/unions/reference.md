# Reference

## Bigunion

<details><summary><code>client.bigunion.<a href="/src/api/resources/bigunion/client/Client.ts">get</a>(id) -> SeedUnions.BigUnion</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.bigunion.get("id");
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

**id:** `string`

</dd>
</dl>

<dl>
<dd>

**requestOptions:** `Bigunion.RequestOptions`

</dd>
</dl>
</dd>
</dl>

</dd>
</dl>
</details>

<details><summary><code>client.bigunion.<a href="/src/api/resources/bigunion/client/Client.ts">update</a>({ ...params }) -> boolean</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.bigunion.update({
    type: "normalSweet",
    value: "value",
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

**request:** `SeedUnions.BigUnion`

</dd>
</dl>

<dl>
<dd>

**requestOptions:** `Bigunion.RequestOptions`

</dd>
</dl>
</dd>
</dl>

</dd>
</dl>
</details>

<details><summary><code>client.bigunion.<a href="/src/api/resources/bigunion/client/Client.ts">updateMany</a>({ ...params }) -> Record<string, boolean></code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.bigunion.updateMany([
    {
        type: "normalSweet",
        value: "value",
    },
    {
        type: "normalSweet",
        value: "value",
    },
]);
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

**request:** `SeedUnions.BigUnion[]`

</dd>
</dl>

<dl>
<dd>

**requestOptions:** `Bigunion.RequestOptions`

</dd>
</dl>
</dd>
</dl>

</dd>
</dl>
</details>

## Union

<details><summary><code>client.union.<a href="/src/api/resources/union/client/Client.ts">get</a>(id) -> SeedUnions.Shape</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.union.get("id");
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

**id:** `string`

</dd>
</dl>

<dl>
<dd>

**requestOptions:** `Union.RequestOptions`

</dd>
</dl>
</dd>
</dl>

</dd>
</dl>
</details>

<details><summary><code>client.union.<a href="/src/api/resources/union/client/Client.ts">update</a>({ ...params }) -> boolean</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.union.update({
    type: "circle",
    radius: 1.1,
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

**request:** `SeedUnions.Shape`

</dd>
</dl>

<dl>
<dd>

**requestOptions:** `Union.RequestOptions`

</dd>
</dl>
</dd>
</dl>

</dd>
</dl>
</details>
