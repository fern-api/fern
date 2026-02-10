# Reference
## Bigunion
<details><summary><code>client.Bigunion.<a href="/src/SeedUnions/Bigunion/BigunionClient.cs">GetAsync</a>(id) -> WithRawResponseTask&lt;BigUnion&gt;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
await client.Bigunion.GetAsync("id");
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
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.Bigunion.<a href="/src/SeedUnions/Bigunion/BigunionClient.cs">UpdateAsync</a>(BigUnion { ... }) -> WithRawResponseTask&lt;bool&gt;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
await client.Bigunion.UpdateAsync(
    new BigUnion(new BigUnion.NormalSweet(new NormalSweet { Value = "value" }))
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

**request:** `BigUnion` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.Bigunion.<a href="/src/SeedUnions/Bigunion/BigunionClient.cs">UpdateManyAsync</a>(IEnumerable&lt;BigUnion&gt; { ... }) -> WithRawResponseTask&lt;Dictionary&lt;string, bool&gt;&gt;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
await client.Bigunion.UpdateManyAsync(
    new List<BigUnion>()
    {
        new BigUnion(new BigUnion.NormalSweet(new NormalSweet { Value = "value" })),
        new BigUnion(new BigUnion.NormalSweet(new NormalSweet { Value = "value" })),
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

**request:** `IEnumerable<BigUnion>` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## Types
<details><summary><code>client.Types.<a href="/src/SeedUnions/Types/TypesClient.cs">GetAsync</a>(id) -> WithRawResponseTask&lt;UnionWithTime&gt;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
await client.Types.GetAsync("date-example");
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
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.Types.<a href="/src/SeedUnions/Types/TypesClient.cs">UpdateAsync</a>(UnionWithTime { ... }) -> WithRawResponseTask&lt;bool&gt;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
await client.Types.UpdateAsync(new UnionWithTime(new UnionWithTime.Date(new DateOnly(1994, 1, 1))));
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

**request:** `UnionWithTime` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## Union
<details><summary><code>client.Union.<a href="/src/SeedUnions/Union/UnionClient.cs">GetAsync</a>(id) -> WithRawResponseTask&lt;Shape&gt;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
await client.Union.GetAsync("id");
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
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.Union.<a href="/src/SeedUnions/Union/UnionClient.cs">UpdateAsync</a>(Shape { ... }) -> WithRawResponseTask&lt;bool&gt;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
await client.Union.UpdateAsync(new Shape(new Shape.Circle(new Circle { Radius = 1.1 })));
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

**request:** `Shape` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>
