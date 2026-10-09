# Reference
<details><summary><code>client.<a href="/src/SeedCsharpPathParamOrder/SeedCsharpPathParamOrderClient.cs">SetApprovedBillAsync</a>(idBill, approved) -> WithRawResponseTask&lt;string&gt;</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Endpoint whose URL lists `idBill` (int) before `approved` (string), but whose
example authors the path-parameters in the reverse order. The generated client
method signature follows URL order, so the test/example writer must bind each
example value to its parameter by name rather than positionally. Otherwise the
arguments are swapped and the C# fails to compile (CS1503).
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
await client.SetApprovedBillAsync(285, "true");
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

**idBill:** `int` 
    
</dd>
</dl>

<dl>
<dd>

**approved:** `string` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

