# Reference
## Bigunion
<details><summary><code>client.Bigunion.<a href="/src/SeedUnions/Bigunion/BigunionClient.cs">GetAsync</a>(id) -> BigUnion</code></summary>
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

<details><summary><code>client.Bigunion.<a href="/src/SeedUnions/Bigunion/BigunionClient.cs">UpdateAsync</a>(BigUnion { ... }) -> bool</code></summary>
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

<details><summary><code>client.Bigunion.<a href="/src/SeedUnions/Bigunion/BigunionClient.cs">UpdateManyAsync</a>(IEnumerable<BigUnion> { ... }) -> Dictionary<string, bool></code></summary>
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
<details><summary><code>client.Types.<a href="/src/SeedUnions/Types/TypesClient.cs">GetAsync</a>(id) -> UnionWithTime</code></summary>
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

<details><summary><code>client.Types.<a href="/src/SeedUnions/Types/TypesClient.cs">UpdateAsync</a>(UnionWithTime { ... }) -> bool</code></summary>
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
<details><summary><code>client.Union.<a href="/src/SeedUnions/Union/UnionClient.cs">GetAsync</a>(id) -> Shape</code></summary>
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

<details><summary><code>client.Union.<a href="/src/SeedUnions/Union/UnionClient.cs">UpdateAsync</a>(Shape { ... }) -> bool</code></summary>
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
