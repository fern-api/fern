# Reference
## Items
<details><summary><code>client.Items.<a href="/src/SeedApi/Items/ItemsClient.cs">ListItemsAsync</a>() -> WithRawResponseTask&lt;string&gt;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
await client.Items.ListItemsAsync();
```
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## Auth
<details><summary><code>client.Auth.<a href="/src/SeedApi/Auth/AuthClient.cs">GettokenAsync</a>(AuthGetTokenRequest { ... }) -> WithRawResponseTask&lt;AuthGetTokenResponse&gt;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
await client.Auth.GettokenAsync(
    new AuthGetTokenRequest { ClientId = "client_id", ClientSecret = "client_secret" }
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

**request:** `AuthGetTokenRequest` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## Files
<details><summary><code>client.Files.<a href="/src/SeedApi/Files/FilesClient.cs">UploadAsync</a>(FilesUploadRequest { ... }) -> WithRawResponseTask&lt;string&gt;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
await client.Files.UploadAsync(new FilesUploadRequest { Name = "name", ParentId = "parent_id" });
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

**request:** `FilesUploadRequest` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

