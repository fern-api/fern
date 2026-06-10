# Reference
## Bytes
## EndpointHeaders
<details><summary><code>client.EndpointHeaders.<a href="/src/SeedCsharpElidePathParameters/EndpointHeaders/EndpointHeadersClient.cs">GetEndpointHeadersPathParamAsync</a>(GetEndpointHeadersPathParamRequest { ... }) -> WithRawResponseTask&lt;User&gt;</code></summary>
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
    new GetEndpointHeadersPathParamRequest { HeaderId = "header_id", XApiVersion = "X-API-Version" }
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

**request:** `GetEndpointHeadersPathParamRequest` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## Headers
<details><summary><code>client.Headers.<a href="/src/SeedCsharpElidePathParameters/Headers/HeadersClient.cs">GetHeadersPathParamAsync</a>(GetHeadersPathParamRequest { ... }) -> WithRawResponseTask&lt;User&gt;</code></summary>
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
    new GetHeadersPathParamRequest { HeaderId = "header_id", XTenantId = "X-Tenant-Id" }
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

**request:** `GetHeadersPathParamRequest` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.Headers.<a href="/src/SeedCsharpElidePathParameters/Headers/HeadersClient.cs">GetHeadersPathParamBodyAsync</a>(GetHeadersPathParamBodyRequest { ... }) -> WithRawResponseTask&lt;User&gt;</code></summary>
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
    new GetHeadersPathParamBodyRequest
    {
        HeaderId = "header_id",
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

**request:** `GetHeadersPathParamBodyRequest` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

