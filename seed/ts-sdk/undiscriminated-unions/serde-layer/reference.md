# Reference
## Union
<details><summary><code>client.union.<a href="/src/api/resources/union/client/Client.ts">get</a>({ ...params }) -> SeedUndiscriminatedUnions.MyUnion</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.union.get("string");

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

**request:** `SeedUndiscriminatedUnions.MyUnion` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `UnionClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.union.<a href="/src/api/resources/union/client/Client.ts">getMetadata</a>() -> SeedUndiscriminatedUnions.Metadata</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.union.getMetadata();

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

**requestOptions:** `UnionClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.union.<a href="/src/api/resources/union/client/Client.ts">updateMetadata</a>({ ...params }) -> boolean</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.union.updateMetadata({
    "string": {
        "key": "value"
    }
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

**request:** `SeedUndiscriminatedUnions.MetadataUnion` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `UnionClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.union.<a href="/src/api/resources/union/client/Client.ts">call</a>({ ...params }) -> boolean</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.union.call({
    union: {
        "string": {
            "key": "value"
        }
    }
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

**request:** `SeedUndiscriminatedUnions.Request` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `UnionClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.union.<a href="/src/api/resources/union/client/Client.ts">duplicateTypesUnion</a>({ ...params }) -> SeedUndiscriminatedUnions.UnionWithDuplicateTypes</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.union.duplicateTypesUnion("string");

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

**request:** `SeedUndiscriminatedUnions.UnionWithDuplicateTypes` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `UnionClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.union.<a href="/src/api/resources/union/client/Client.ts">nestedUnions</a>({ ...params }) -> string</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.union.nestedUnions("string");

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

**request:** `SeedUndiscriminatedUnions.NestedUnionRoot` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `UnionClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.union.<a href="/src/api/resources/union/client/Client.ts">nestedObjectUnions</a>({ ...params }) -> string</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.union.nestedObjectUnions("string");

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

**request:** `SeedUndiscriminatedUnions.OuterNestedUnion` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `UnionClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.union.<a href="/src/api/resources/union/client/Client.ts">aliasedObjectUnion</a>({ ...params }) -> string</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.union.aliasedObjectUnion({
    onlyInA: "onlyInA",
    sharedNumber: 1
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

**request:** `SeedUndiscriminatedUnions.AliasedObjectUnion` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `UnionClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.union.<a href="/src/api/resources/union/client/Client.ts">getWithBaseProperties</a>({ ...params }) -> SeedUndiscriminatedUnions.UnionWithBaseProperties</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.union.getWithBaseProperties({
    name: "name",
    value: {
        "value": {
            "key": "value"
        }
    }
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

**request:** `SeedUndiscriminatedUnions.UnionWithBaseProperties` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `UnionClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.union.<a href="/src/api/resources/union/client/Client.ts">testCamelCaseProperties</a>({ ...params }) -> string</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.union.testCamelCaseProperties({
    paymentMethod: {
        method: "card",
        cardNumber: "1234567890123456"
    }
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

**request:** `SeedUndiscriminatedUnions.PaymentRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `UnionClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

