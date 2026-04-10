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
$client->service->post(
    new ServicePostRequest([
        'file' => File::createFromString("example_file", "example_file"),
        'fileList' => File::createFromString("example_file_list", "example_file_list"),
        'maybeFile' => File::createFromString("example_maybe_file", "example_maybe_file"),
        'maybeFileList' => File::createFromString("example_maybe_file_list", "example_maybe_file_list"),
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

<details><summary><code>$client-&gt;service-&gt;justfile($request)</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```php
$client->service->justfile(
    new ServiceJustFileRequest([
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

<details><summary><code>$client-&gt;service-&gt;justfilewithqueryparams($request)</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```php
$client->service->justfilewithqueryparams($request);
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

**$listOfStrings:** `?string` 
    
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

<details><summary><code>$client-&gt;service-&gt;justfilewithoptionalqueryparams($request)</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```php
$client->service->justfilewithoptionalqueryparams(
    new ServiceJustFileWithOptionalQueryParamsRequest([
        'file' => File::createFromString("example_file", "example_file"),
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

<details><summary><code>$client-&gt;service-&gt;withcontenttype($request)</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```php
$client->service->withcontenttype(
    new ServiceWithContentTypeRequest([
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

<details><summary><code>$client-&gt;service-&gt;withformencoding($request)</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```php
$client->service->withformencoding(
    new ServiceWithFormEncodingRequest([
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

<details><summary><code>$client-&gt;service-&gt;withformencodedcontainers($request)</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```php
$client->service->withformencodedcontainers(
    new ServiceWithFormEncodedContainersRequest([
        'file' => File::createFromString("example_file", "example_file"),
        'fileList' => File::createFromString("example_file_list", "example_file_list"),
        'maybeFile' => File::createFromString("example_maybe_file", "example_maybe_file"),
        'maybeFileList' => File::createFromString("example_maybe_file_list", "example_maybe_file_list"),
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

<details><summary><code>$client-&gt;service-&gt;optionalargs($request) -> ?string</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```php
$client->service->optionalargs(
    new ServiceOptionalArgsRequest([
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

<details><summary><code>$client-&gt;service-&gt;withinlinetype($request) -> ?string</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```php
$client->service->withinlinetype(
    new ServiceWithInlineTypeRequest([
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

<details><summary><code>$client-&gt;service-&gt;withjsonproperty($request) -> ?string</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```php
$client->service->withjsonproperty(
    new ServiceWithJsonPropertyRequest([
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

<details><summary><code>$client-&gt;service-&gt;withliteralandenumtypes($request) -> ?string</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```php
$client->service->withliteralandenumtypes(
    new ServiceWithLiteralAndEnumTypesRequest([
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

