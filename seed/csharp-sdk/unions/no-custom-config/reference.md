# Reference
## Bigunion
<details><summary><code>client.Bigunion.<a href="/src/SeedUnions/Bigunion/BigunionClient.cs">GetAsync</a>(id) -> SeedUnions.BigUnion</code></summary>
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

<details><summary><code>client.Bigunion.<a href="/src/SeedUnions/Bigunion/BigunionClient.cs">UpdateAsync</a>(SeedUnions.BigUnion { ... }) -> bool</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
await client.Bigunion.UpdateAsync(
    new SeedUnions.BigUnion(
        new SeedUnions.BigUnion.NormalSweet(new SeedUnions.NormalSweet { Value = "value" })
    )
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

**request:** `SeedUnions.BigUnion` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.Bigunion.<a href="/src/SeedUnions/Bigunion/BigunionClient.cs">UpdateManyAsync</a>(IEnumerable<SeedUnions.BigUnion> { ... }) -> Dictionary<string, bool></code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
await client.Bigunion.UpdateManyAsync(
    new List<SeedUnions.BigUnion>()
    {
        new SeedUnions.BigUnion(
            new SeedUnions.BigUnion.NormalSweet(new SeedUnions.NormalSweet { Value = "value" })
        ),
        new SeedUnions.BigUnion(
            new SeedUnions.BigUnion.NormalSweet(new SeedUnions.NormalSweet { Value = "value" })
        ),
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

**request:** `IEnumerable<SeedUnions.BigUnion>` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## Union
<details><summary><code>client.Union.<a href="/src/SeedUnions/Union/UnionClient.cs">GetAsync</a>(id) -> SeedUnions.Shape</code></summary>
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

<details><summary><code>client.Union.<a href="/src/SeedUnions/Union/UnionClient.cs">UpdateAsync</a>(SeedUnions.Shape { ... }) -> bool</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
await client.Union.UpdateAsync(
    new SeedUnions.Shape(new SeedUnions.Shape.Circle(new SeedUnions.Circle { Radius = 1.1 }))
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

**request:** `SeedUnions.Shape` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>
