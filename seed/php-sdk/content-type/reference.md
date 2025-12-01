# Reference
## Service
<details><summary><code>$client->service->patch($request)</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```php
$client->service->patch(
    new PatchProxyRequest([
        'application' => 'application',
        'requireAuth' => true,
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

**$application:** `?string` 
    
</dd>
</dl>

<dl>
<dd>

**$requireAuth:** `?bool` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>$client->service->patchComplex($id, $request)</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Update with JSON merge patch - complex types.
This endpoint demonstrates the distinction between:
- optional<T> fields (can be present or absent, but not null)
- optional<nullable<T>> fields (can be present, absent, or null)
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
$client->service->patchComplex(
    'id',
    new PatchComplexRequest([
        'name' => 'name',
        'age' => 1,
        'active' => true,
        'metadata' => [
            'metadata' => [
                'key' => "value",
            ],
        ],
        'tags' => [
            'tags',
            'tags',
        ],
        'email' => 'email',
        'nickname' => 'nickname',
        'bio' => 'bio',
        'profileImageUrl' => 'profileImageUrl',
        'settings' => [
            'settings' => [
                'key' => "value",
            ],
        ],
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

**$id:** `string` 
    
</dd>
</dl>

<dl>
<dd>

**$name:** `?string` 
    
</dd>
</dl>

<dl>
<dd>

**$age:** `?int` 
    
</dd>
</dl>

<dl>
<dd>

**$active:** `?bool` 
    
</dd>
</dl>

<dl>
<dd>

**$metadata:** `?array` 
    
</dd>
</dl>

<dl>
<dd>

**$tags:** `?array` 
    
</dd>
</dl>

<dl>
<dd>

**$email:** `?string` 
    
</dd>
</dl>

<dl>
<dd>

**$nickname:** `?string` 
    
</dd>
</dl>

<dl>
<dd>

**$bio:** `?string` 
    
</dd>
</dl>

<dl>
<dd>

**$profileImageUrl:** `?string` 
    
</dd>
</dl>

<dl>
<dd>

**$settings:** `?array` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>$client->service->namedPatchWithMixed($id, $request)</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Named request with mixed optional/nullable fields and merge-patch content type.
This should trigger the NPE issue when optional fields aren't initialized.
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
$client->service->namedPatchWithMixed(
    'id',
    new NamedMixedPatchRequest([
        'appId' => 'appId',
        'instructions' => 'instructions',
        'active' => true,
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

**$id:** `string` 
    
</dd>
</dl>

<dl>
<dd>

**$appId:** `?string` 
    
</dd>
</dl>

<dl>
<dd>

**$instructions:** `?string` 
    
</dd>
</dl>

<dl>
<dd>

**$active:** `?bool` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>$client->service->optionalMergePatchTest($request)</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Test endpoint to verify Optional field initialization and JsonSetter with Nulls.SKIP.
This endpoint should:
1. Not NPE when fields are not provided (tests initialization)
2. Not NPE when fields are explicitly null in JSON (tests Nulls.SKIP)
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
$client->service->optionalMergePatchTest(
    new OptionalMergePatchRequest([
        'requiredField' => 'requiredField',
        'optionalString' => 'optionalString',
        'optionalInteger' => 1,
        'optionalBoolean' => true,
        'nullableString' => 'nullableString',
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

**$requiredField:** `string` 
    
</dd>
</dl>

<dl>
<dd>

**$optionalString:** `?string` 
    
</dd>
</dl>

<dl>
<dd>

**$optionalInteger:** `?int` 
    
</dd>
</dl>

<dl>
<dd>

**$optionalBoolean:** `?bool` 
    
</dd>
</dl>

<dl>
<dd>

**$nullableString:** `?string` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>$client->service->regularPatch($id, $request)</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Regular PATCH endpoint without merge-patch semantics
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
$client->service->regularPatch(
    'id',
    new RegularPatchRequest([
        'field1' => 'field1',
        'field2' => 1,
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

**$id:** `string` 
    
</dd>
</dl>

<dl>
<dd>

**$field1:** `?string` 
    
</dd>
</dl>

<dl>
<dd>

**$field2:** `?int` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>
