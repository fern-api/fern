# Reference
## Bytes
## EndpointHeaders
<details><summary><code>client.EndpointHeaders.<a href="/src/SeedCsharpElidePathParameters/EndpointHeaders/EndpointHeadersClient.cs">GetEndpointHeadersPathParamAsync</a>(headerId, GetEndpointHeadersPathParamRequest { ... }) -> WithRawResponseTask&lt;User&gt;</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Endpoint with only path parameters and endpoint-level headers but NO service-level headers. The wrapper should NOT be elided because it holds the endpoint header field.
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
await client.EndpointHeaders.GetEndpointHeadersPathParamAsync(
    "header_id",
    new GetEndpointHeadersPathParamRequest { XApiVersion = "X-API-Version" }
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

**headerId:** `string` 
    
</dd>
</dl>

<dl>
<dd>

**request:** `GetEndpointHeadersPathParamRequest` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## Headers
<details><summary><code>client.Headers.<a href="/src/SeedCsharpElidePathParameters/Headers/HeadersClient.cs">GetHeadersPathParamAsync</a>(headerId, GetHeadersPathParamRequest { ... }) -> WithRawResponseTask&lt;User&gt;</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Endpoint with only path parameters but service-level headers. The wrapper should NOT be elided because it holds the service header field.
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
await client.Headers.GetHeadersPathParamAsync(
    "header_id",
    new GetHeadersPathParamRequest { XTenantId = "X-Tenant-Id" }
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

**headerId:** `string` 
    
</dd>
</dl>

<dl>
<dd>

**request:** `GetHeadersPathParamRequest` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.Headers.<a href="/src/SeedCsharpElidePathParameters/Headers/HeadersClient.cs">GetHeadersPathParamBodyAsync</a>(headerId, GetHeadersPathParamBodyRequest { ... }) -> WithRawResponseTask&lt;User&gt;</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Endpoint with path parameter + body + service-level headers. The wrapper should NOT be unwrapped because of service headers.
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
await client.Headers.GetHeadersPathParamBodyAsync(
    "header_id",
    new GetHeadersPathParamBodyRequest
    {
        XTenantId = "X-Tenant-Id",
        Body = new User
        {
            Name = "name",
            Tags = new List<string>() { "tags", "tags" },
        },
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

**headerId:** `string` 
    
</dd>
</dl>

<dl>
<dd>

**request:** `GetHeadersPathParamBodyRequest` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

