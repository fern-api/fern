# Reference
<details><summary><code>client.<a href="/src/SeedApi/SeedApiClient.cs">SearchRuleTypesAsync</a>(SearchRuleTypesRequest { ... }) -> WithRawResponseTask&lt;RuleTypeSearchResponse&gt;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
await client.SearchRuleTypesAsync(new SearchRuleTypesRequest());
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

**request:** `SearchRuleTypesRequest` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.<a href="/src/SeedApi/SeedApiClient.cs">CreateRuleAsync</a>(RuleCreateRequest { ... }) -> WithRawResponseTask&lt;RuleResponse&gt;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
await client.CreateRuleAsync(
    new RuleCreateRequest { Name = "name", ExecutionContext = RuleExecutionContext.Prod }
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

**request:** `RuleCreateRequest` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.<a href="/src/SeedApi/SeedApiClient.cs">ListUsersAsync</a>() -> WithRawResponseTask&lt;UserSearchResponse&gt;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
await client.ListUsersAsync();
```
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.<a href="/src/SeedApi/SeedApiClient.cs">GetEntityAsync</a>() -> WithRawResponseTask&lt;CombinedEntity&gt;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
await client.GetEntityAsync();
```
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.<a href="/src/SeedApi/SeedApiClient.cs">GetOrganizationAsync</a>() -> WithRawResponseTask&lt;Organization&gt;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
await client.GetOrganizationAsync();
```
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

