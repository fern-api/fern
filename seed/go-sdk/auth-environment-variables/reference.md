# Reference
## Service
<details><summary><code>client.Service.GetWithApiKey() -> string</code></summary>
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

```go
client.Service.GetWithApiKey(
        context.TODO(),
    )
}
```
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.Service.GetWithHeader() -> string</code></summary>
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

```go
client.Service.GetWithHeader(
        context.TODO(),
        &fern.HeaderAuthRequest{
            XEndpointHeader: "X-Endpoint-Header",
        },
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

**xEndpointHeader:** `string` — Specifies the endpoint key.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>
