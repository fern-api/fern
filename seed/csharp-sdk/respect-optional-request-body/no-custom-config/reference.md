# Reference
<details><summary><code>client.<a href="/src/SeedApi/SeedApiClient.cs">RefundAsync</a>(RefundBody { ... }) -> WithRawResponseTask</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
await client.RefundAsync(
    new RefundBody
    {
        Id = "refund-id",
        Body = new RefundRequest { Amount = 60 },
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

**request:** `RefundBody` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.<a href="/src/SeedApi/SeedApiClient.cs">RequiredRefundAsync</a>(RequiredRefundRequest { ... }) -> WithRawResponseTask</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
await client.RequiredRefundAsync(
    new RequiredRefundRequest
    {
        Id = "refund-id",
        Body = new RefundRequest { Amount = 60 },
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

**request:** `RequiredRefundRequest` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.<a href="/src/SeedApi/SeedApiClient.cs">BulkRefundAsync</a>(RefundRequest { ... }) -> WithRawResponseTask</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
await client.BulkRefundAsync(new RefundRequest());
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

**request:** `RefundRequest` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

