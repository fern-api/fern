# Reference
## Optional
<details><summary><code>$client-&gt;optional-&gt;sendoptionalbody($request) -> ?string</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```php
$client->optional->sendoptionalbody(
    [
        'key' => "value",
    ],
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

**$request:** `?array` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>$client-&gt;optional-&gt;sendoptionaltypedbody($request) -> ?string</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```php
$client->optional->sendoptionaltypedbody(
    new SendOptionalBodyRequest([
        'message' => 'message',
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

**$message:** `string` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>$client-&gt;optional-&gt;sendoptionalnullablewithalloptionalproperties($actionId, $id, $request) -> ?DeployResponse</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Tests optional(nullable(T)) where T has only optional properties.
This should not generate wire tests expecting {} when Optional.empty() is passed.
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
$client->optional->sendoptionalnullablewithalloptionalproperties(
    'actionId',
    'id',
    new DeployParams([]),
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

**$actionId:** `string` 
    
</dd>
</dl>

<dl>
<dd>

**$id:** `string` 
    
</dd>
</dl>

<dl>
<dd>

**$updateDraft:** `?bool` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

