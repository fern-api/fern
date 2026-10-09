# Reference
## Oauth
<details><summary><code>$client-&gt;oauth-&gt;authorize($request) -> ?AuthorizeResponse</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Authorization-code grant with PKCE. `response_type` is a required literal that is
hardcoded by the generated method; `code_challenge_method` is an optional literal
that must still be sent on the wire when provided.
</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```php
$client->oauth->authorize(
    new AuthorizeRequest([
        'responseType' => 'code',
        'clientId' => 'client_abc123',
        'redirectUri' => 'https://example.com/callback',
        'codeChallenge' => 'E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM',
        'codeChallengeMethod' => 'S256',
        'scope' => 'read write',
        'state' => 'xyz',
    ]),
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

**$responseType:** `string` 
    
</dd>
</dl>

<dl>
<dd>

**$clientId:** `string` 
    
</dd>
</dl>

<dl>
<dd>

**$redirectUri:** `string` 
    
</dd>
</dl>

<dl>
<dd>

**$codeChallenge:** `string` 
    
</dd>
</dl>

<dl>
<dd>

**$codeChallengeMethod:** `?string` 
    
</dd>
</dl>

<dl>
<dd>

**$scope:** `?string` 
    
</dd>
</dl>

<dl>
<dd>

**$state:** `?string` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

