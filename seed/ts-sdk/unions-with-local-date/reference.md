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

**requestOptions:** `BigunionClient.RequestOptions` 
    
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
    id: "id",
    "created-at": "2024-01-15T09:30:00Z",
    "archived-at": "2024-01-15T09:30:00Z",
    value: "value"
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

**requestOptions:** `BigunionClient.RequestOptions` 
    
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
await client.bigunion.updateMany([{
        type: "normalSweet",
        id: "id",
        "created-at": "2024-01-15T09:30:00Z",
        "archived-at": "2024-01-15T09:30:00Z",
        value: "value"
    }, {
        type: "normalSweet",
        id: "id",
        "created-at": "2024-01-15T09:30:00Z",
        "archived-at": "2024-01-15T09:30:00Z",
        value: "value"
    }]);

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

**requestOptions:** `BigunionClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## Types
<details><summary><code>client.types.<a href="/src/api/resources/types/client/Client.ts">get</a>(id) -> SeedUnions.UnionWithTime</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.types.get("date-example");

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

**requestOptions:** `TypesClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.types.<a href="/src/api/resources/types/client/Client.ts">update</a>({ ...params }) -> boolean</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.types.update({
    type: "date",
    value: "1994-01-01"
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

**request:** `SeedUnions.UnionWithTime` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `TypesClient.RequestOptions` 
    
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

**requestOptions:** `UnionClient.RequestOptions` 
    
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
    id: "id",
    name: "name",
    radius: 1.1
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

**requestOptions:** `UnionClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>
