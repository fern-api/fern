# Reference
## Service
<details><summary><code>client.Service.<a href="/src/SeedAuthEnvironmentVariables/Service/ServiceClient.cs">GetWithApiKeyAsync</a>() -> string</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

GET request with custom api key
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
await client.Service.GetWithApiKeyAsync();
```
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.Service.<a href="/src/SeedAuthEnvironmentVariables/Service/ServiceClient.cs">GetWithHeaderAsync</a>(SeedAuthEnvironmentVariables.HeaderAuthRequest { ... }) -> string</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

GET request with custom api key
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
await client.Service.GetWithHeaderAsync(
    new SeedAuthEnvironmentVariables.HeaderAuthRequest { XEndpointHeader = "X-Endpoint-Header" }
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

**request:** `SeedAuthEnvironmentVariables.HeaderAuthRequest` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>
