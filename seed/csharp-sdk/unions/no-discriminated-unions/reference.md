# Reference
## Bigunion
<details><summary><code>client.Bigunion.<a href="/src/SeedApi/Bigunion/BigunionClient.cs">GetAsync</a>(BigunionGetRequest { ... }) -> WithRawResponseTask&lt;OneOf&lt;BigUnionZero, BigUnionOne, BigUnionTwo, BigUnionThree, BigUnionFour, BigUnionFive, BigUnionSix, BigUnionSeven, BigUnionEight, BigUnionNine, BigUnionTen, BigUnionEleven, BigUnionTwelve, BigUnionThirteen, BigUnionFourteen, BigUnionFifteen, BigUnionSixteen, BigUnionSeventeen, BigUnionEighteen, BigUnionNineteen, BigUnionTwenty, BigUnionTwentyOne, BigUnionTwentyTwo, BigUnionTwentyThree, BigUnionTwentyFour, BigUnionTwentyFive, BigUnionTwentySix, BigUnionTwentySeven, BigUnionTwentyEight&gt;&gt;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
await client.Bigunion.GetAsync(new BigunionGetRequest { Id = "id" });
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

**request:** `BigunionGetRequest` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.Bigunion.<a href="/src/SeedApi/Bigunion/BigunionClient.cs">UpdateAsync</a>(OneOf&lt;BigUnionZero, BigUnionOne, BigUnionTwo, BigUnionThree, BigUnionFour, BigUnionFive, BigUnionSix, BigUnionSeven, BigUnionEight, BigUnionNine, BigUnionTen, BigUnionEleven, BigUnionTwelve, BigUnionThirteen, BigUnionFourteen, BigUnionFifteen, BigUnionSixteen, BigUnionSeventeen, BigUnionEighteen, BigUnionNineteen, BigUnionTwenty, BigUnionTwentyOne, BigUnionTwentyTwo, BigUnionTwentyThree, BigUnionTwentyFour, BigUnionTwentyFive, BigUnionTwentySix, BigUnionTwentySeven, BigUnionTwentyEight&gt; { ... }) -> WithRawResponseTask&lt;bool&gt;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
await client.Bigunion.UpdateAsync(
    new BigUnionZero { Value = "value", Type = BigUnionZeroType.NormalSweet }
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

**request:** `OneOf<BigUnionZero, BigUnionOne, BigUnionTwo, BigUnionThree, BigUnionFour, BigUnionFive, BigUnionSix, BigUnionSeven, BigUnionEight, BigUnionNine, BigUnionTen, BigUnionEleven, BigUnionTwelve, BigUnionThirteen, BigUnionFourteen, BigUnionFifteen, BigUnionSixteen, BigUnionSeventeen, BigUnionEighteen, BigUnionNineteen, BigUnionTwenty, BigUnionTwentyOne, BigUnionTwentyTwo, BigUnionTwentyThree, BigUnionTwentyFour, BigUnionTwentyFive, BigUnionTwentySix, BigUnionTwentySeven, BigUnionTwentyEight>` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.Bigunion.<a href="/src/SeedApi/Bigunion/BigunionClient.cs">UpdateManyAsync</a>(IEnumerable&lt;OneOf&lt;BigUnionZero, BigUnionOne, BigUnionTwo, BigUnionThree, BigUnionFour, BigUnionFive, BigUnionSix, BigUnionSeven, BigUnionEight, BigUnionNine, BigUnionTen, BigUnionEleven, BigUnionTwelve, BigUnionThirteen, BigUnionFourteen, BigUnionFifteen, BigUnionSixteen, BigUnionSeventeen, BigUnionEighteen, BigUnionNineteen, BigUnionTwenty, BigUnionTwentyOne, BigUnionTwentyTwo, BigUnionTwentyThree, BigUnionTwentyFour, BigUnionTwentyFive, BigUnionTwentySix, BigUnionTwentySeven, BigUnionTwentyEight&gt;&gt; { ... }) -> WithRawResponseTask&lt;Dictionary&lt;string, bool&gt;&gt;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
await client.Bigunion.UpdateManyAsync(
    new List<
        OneOf<
            BigUnionZero,
            BigUnionOne,
            BigUnionTwo,
            BigUnionThree,
            BigUnionFour,
            BigUnionFive,
            BigUnionSix,
            BigUnionSeven,
            BigUnionEight,
            BigUnionNine,
            BigUnionTen,
            BigUnionEleven,
            BigUnionTwelve,
            BigUnionThirteen,
            BigUnionFourteen,
            BigUnionFifteen,
            BigUnionSixteen,
            BigUnionSeventeen,
            BigUnionEighteen,
            BigUnionNineteen,
            BigUnionTwenty,
            BigUnionTwentyOne,
            BigUnionTwentyTwo,
            BigUnionTwentyThree,
            BigUnionTwentyFour,
            BigUnionTwentyFive,
            BigUnionTwentySix,
            BigUnionTwentySeven,
            BigUnionTwentyEight
        >
    >()
    {
        new BigUnionZero { Value = "value", Type = BigUnionZeroType.NormalSweet },
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

**request:** `IEnumerable<OneOf<BigUnionZero, BigUnionOne, BigUnionTwo, BigUnionThree, BigUnionFour, BigUnionFive, BigUnionSix, BigUnionSeven, BigUnionEight, BigUnionNine, BigUnionTen, BigUnionEleven, BigUnionTwelve, BigUnionThirteen, BigUnionFourteen, BigUnionFifteen, BigUnionSixteen, BigUnionSeventeen, BigUnionEighteen, BigUnionNineteen, BigUnionTwenty, BigUnionTwentyOne, BigUnionTwentyTwo, BigUnionTwentyThree, BigUnionTwentyFour, BigUnionTwentyFive, BigUnionTwentySix, BigUnionTwentySeven, BigUnionTwentyEight>>` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## Union
<details><summary><code>client.Union.<a href="/src/SeedApi/Union/UnionClient.cs">GetAsync</a>(UnionGetRequest { ... }) -> WithRawResponseTask&lt;OneOf&lt;ShapeZero, ShapeOne&gt;&gt;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
await client.Union.GetAsync(new UnionGetRequest { Id = "id" });
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

**request:** `UnionGetRequest` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.Union.<a href="/src/SeedApi/Union/UnionClient.cs">UpdateAsync</a>(OneOf&lt;ShapeZero, ShapeOne&gt; { ... }) -> WithRawResponseTask&lt;bool&gt;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
await client.Union.UpdateAsync(new ShapeZero { Radius = 1.1, Type = ShapeZeroType.Circle });
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

**request:** `OneOf<ShapeZero, ShapeOne>` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

