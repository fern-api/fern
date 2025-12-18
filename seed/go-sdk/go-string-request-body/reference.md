# Reference
<details><summary><code>client.DidCommMessageRecv(TenantId, request) -> error</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```go
request := &fern.DidCommMessageRecvRequest{
        TenantId: "tenant_id",
        Body: "string",
    }
client.DidCommMessageRecv(
        context.TODO(),
        request,
    )
}
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

**tenantId:** `string` 
    
</dd>
</dl>

<dl>
<dd>

**request:** `string` — Base64-encoded DIDComm signed message
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>
