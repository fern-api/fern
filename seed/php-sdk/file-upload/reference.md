# Reference
## Service
<details><summary><code>$client-&gt;service-&gt;post($request)</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```php
$client->service->post($request);
```
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>$client-&gt;service-&gt;justFile($request)</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```php
$client->service->justFile(
    new JustFileRequest([
        'file' => File::createFromString("example_file", "example_file"),
    ]),
);
```
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>$client-&gt;service-&gt;justFileWithQueryParams($request)</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```php
$client->service->justFileWithQueryParams($request);
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

**$maybeString:** `?string` 
    
</dd>
</dl>

<dl>
<dd>

**$integer:** `int` 
    
</dd>
</dl>

<dl>
<dd>

**$maybeInteger:** `?int` 
    
</dd>
</dl>

<dl>
<dd>

**$listOfStrings:** `string` 
    
</dd>
</dl>

<dl>
<dd>

**$optionalListOfStrings:** `?string` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>$client-&gt;service-&gt;justFileWithOptionalQueryParams($request)</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```php
$client->service->justFileWithOptionalQueryParams($request);
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

**$maybeString:** `?string` 
    
</dd>
</dl>

<dl>
<dd>

**$maybeInteger:** `?int` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>$client-&gt;service-&gt;withContentType($request)</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```php
$client->service->withContentType($request);
```
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>$client-&gt;service-&gt;withFormEncoding($request)</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```php
$client->service->withFormEncoding($request);
```
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>$client-&gt;service-&gt;withFormEncodedContainers($request)</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```php
$client->service->withFormEncodedContainers($request);
```
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>$client-&gt;service-&gt;optionalArgs($request) -> string</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```php
$client->service->optionalArgs(
    new OptionalArgsRequest([
        'imageFile' => File::createFromString("example_image_file", "example_image_file"),
    ]),
);
```
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>$client-&gt;service-&gt;withInlineType($request) -> string</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```php
$client->service->withInlineType($request): string;
```
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>$client-&gt;service-&gt;simple()</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```php
$client->service->simple();
```
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>
