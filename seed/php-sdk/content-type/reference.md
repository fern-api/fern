# Reference
## Service
<details><summary><code>$client-&gt;service-&gt;patch($request)</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```php
$client->service->patch(
    new ServicePatchRequest([]),
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

<details><summary><code>$client-&gt;service-&gt;patchcomplex($id, $request)</code></summary>
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
$client->service->patchcomplex(
    'id',
    new ServicePatchComplexRequest([]),
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

<details><summary><code>$client-&gt;service-&gt;namedpatchwithmixed($id, $request)</code></summary>
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
$client->service->namedpatchwithmixed(
    'id',
    new ServiceNamedPatchWithMixedRequest([]),
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

<details><summary><code>$client-&gt;service-&gt;optionalmergepatchtest($request)</code></summary>
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
$client->service->optionalmergepatchtest(
    new ServiceOptionalMergePatchTestRequest([
        'requiredField' => 'requiredField',
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

<details><summary><code>$client-&gt;service-&gt;regularpatch($id, $request)</code></summary>
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
$client->service->regularpatch(
    'id',
    new ServiceRegularPatchRequest([]),
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

