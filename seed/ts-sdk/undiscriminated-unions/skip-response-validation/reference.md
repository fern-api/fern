# Reference
## Union
<details><summary><code>client.union.<a href="/src/api/resources/union/client/Client.ts">get</a>({ ...params }) -> SeedApi.MyUnion</code></summary>
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

**request:** `SeedApi.MyUnion` 
    
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

<details><summary><code>client.union.<a href="/src/api/resources/union/client/Client.ts">getmetadata</a>() -> SeedApi.Metadata</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.union.getmetadata();

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

<details><summary><code>client.union.<a href="/src/api/resources/union/client/Client.ts">updatemetadata</a>({ ...params }) -> boolean</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.union.updatemetadata({
    "key": "value"
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

**request:** `SeedApi.MetadataUnion` 
    
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
await client.union.call();

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

**request:** `SeedApi.Request` 
    
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

<details><summary><code>client.union.<a href="/src/api/resources/union/client/Client.ts">duplicatetypesunion</a>({ ...params }) -> SeedApi.UnionWithDuplicateTypes</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.union.duplicatetypesunion("string");

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

**request:** `SeedApi.UnionWithDuplicateTypes` 
    
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

<details><summary><code>client.union.<a href="/src/api/resources/union/client/Client.ts">nestedunions</a>({ ...params }) -> string</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.union.nestedunions("string");

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

**request:** `SeedApi.NestedUnionRoot` 
    
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

<details><summary><code>client.union.<a href="/src/api/resources/union/client/Client.ts">testcamelcaseproperties</a>({ ...params }) -> string</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.union.testcamelcaseproperties({
    paymentMethod: {
        method: "method",
        cardNumber: "cardNumber"
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

**request:** `SeedApi.UnionTestCamelCasePropertiesRequest` 
    
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

