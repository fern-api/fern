# Reference
## Optional
<details><summary><code>client.Optional.<a href="/src/SeedApi/Optional/OptionalClient.cs">SendoptionalbodyAsync</a>(Dictionary&lt;string, object?&gt;? { ... }) -> WithRawResponseTask&lt;string&gt;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
await client.Optional.SendoptionalbodyAsync(
    new Dictionary<string, object?>() { { "key", "value" } }
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

**request:** `Dictionary<string, object?>?` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.Optional.<a href="/src/SeedApi/Optional/OptionalClient.cs">SendoptionaltypedbodyAsync</a>(SendOptionalBodyRequest { ... }) -> WithRawResponseTask&lt;string&gt;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
await client.Optional.SendoptionaltypedbodyAsync(
    new SendOptionalBodyRequest { Message = "message" }
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

**request:** `SendOptionalBodyRequest` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.Optional.<a href="/src/SeedApi/Optional/OptionalClient.cs">SendoptionalnullablewithalloptionalpropertiesAsync</a>(DeployParams { ... }) -> WithRawResponseTask&lt;DeployResponse&gt;</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Tests optional(nullable(T)) where T has only optional properties.
This should not generate wire tests expecting {} when Optional.empty() is passed.
</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
await client.Optional.SendoptionalnullablewithalloptionalpropertiesAsync(
    new DeployParams { ActionId = "actionId", Id = "id" }
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

**request:** `DeployParams` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

