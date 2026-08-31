# Reference
## Identity
<details><summary><code>client.Identity.<a href="/src/SeedApi/Identity/IdentityClient.cs">GetTokenAsync</a>(GetTokenIdentityRequest { ... }) -> WithRawResponseTask&lt;TokenResponse&gt;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
await client.Identity.GetTokenAsync(
    new GetTokenIdentityRequest { Username = "username", Password = "password" }
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

**request:** `GetTokenIdentityRequest` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## Plants
<details><summary><code>client.Plants.<a href="/src/SeedApi/Plants/PlantsClient.cs">ListAsync</a>() -> WithRawResponseTask&lt;IEnumerable&lt;Plant&gt;&gt;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
await client.Plants.ListAsync();
```
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.Plants.<a href="/src/SeedApi/Plants/PlantsClient.cs">GetAsync</a>(GetPlantsRequest { ... }) -> WithRawResponseTask&lt;Plant&gt;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
await client.Plants.GetAsync(new GetPlantsRequest { PlantId = "plantId" });
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

**request:** `GetPlantsRequest` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

