# Reference
## 
<details><summary><code>$client-&gt;-&gt;echo_($request) -> ?string</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```php
$client->_->echo_(
    'string',
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

**$request:** `string` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>$client-&gt;-&gt;createType($request) -> ?Identifier</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```php
$client->_->createType(
    BasicType::Primitive->value,
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

**$request:** `string` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## FileNotificationService
<details><summary><code>$client-&gt;fileNotificationService-&gt;fileNotificationServiceGetException($notificationId) -> ExceptionZero|ExceptionType|null</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```php
$client->fileNotificationService->fileNotificationServiceGetException(
    'notificationId',
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

**$notificationId:** `string` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## FileService
<details><summary><code>$client-&gt;fileService-&gt;fileServiceGetFile($filename) -> ?File</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

This endpoint returns a file by its name.
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
$client->fileService->fileServiceGetFile(
    'filename',
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

**$filename:** `string` — This is a filename
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## HealthService
<details><summary><code>$client-&gt;healthService-&gt;healthServiceCheck($id)</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

This endpoint checks the health of a resource.
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
$client->healthService->healthServiceCheck(
    'id',
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

**$id:** `string` — The id to check
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>$client-&gt;healthService-&gt;healthServicePing() -> ?bool</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

This endpoint checks the health of the service.
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
$client->healthService->healthServicePing();
```
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## Service
<details><summary><code>$client-&gt;service-&gt;getmovie($movieId) -> ?Movie</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```php
$client->service->getmovie(
    'movieId',
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

**$movieId:** `string` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>$client-&gt;service-&gt;createmovie($request) -> ?string</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```php
$client->service->createmovie(
    new Movie([
        'id' => 'id',
        'title' => 'title',
        'from' => 'from',
        'rating' => 1.1,
        'type' => MovieType::Movie->value,
        'tag' => 'tag',
        'metadata' => [
            'key' => "value",
        ],
        'revenue' => 1000000,
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

**$request:** `Movie` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>$client-&gt;service-&gt;getmetadata($request) -> ?Metadata</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```php
$client->service->getmetadata(
    new ServiceGetMetadataRequest([
        'apiVersion' => 'X-API-Version',
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

**$shallow:** `?bool` 
    
</dd>
</dl>

<dl>
<dd>

**$tag:** `?string` 
    
</dd>
</dl>

<dl>
<dd>

**$apiVersion:** `string` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>$client-&gt;service-&gt;createbigentity($request) -> ?Response</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```php
$client->service->createbigentity(
    new BigEntity([]),
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

**$castMember:** `Actor|Actress|StuntDouble|null` 
    
</dd>
</dl>

<dl>
<dd>

**$extendedMovie:** `?ExtendedMovie` 
    
</dd>
</dl>

<dl>
<dd>

**$entity:** `?Entity` 
    
</dd>
</dl>

<dl>
<dd>

**$metadata:** `?Metadata` 
    
</dd>
</dl>

<dl>
<dd>

**$commonMetadata:** `?CommonsMetadata` 
    
</dd>
</dl>

<dl>
<dd>

**$eventInfo:** `CommonsEventInfoZero|CommonsEventInfoType|null` 
    
</dd>
</dl>

<dl>
<dd>

**$data:** `?CommonsData` 
    
</dd>
</dl>

<dl>
<dd>

**$migration:** `?Migration` 
    
</dd>
</dl>

<dl>
<dd>

**$exception:** `ExceptionZero|ExceptionType|null` 
    
</dd>
</dl>

<dl>
<dd>

**$test:** `?Test` 
    
</dd>
</dl>

<dl>
<dd>

**$node:** `?Node` 
    
</dd>
</dl>

<dl>
<dd>

**$directory:** `?Directory` 
    
</dd>
</dl>

<dl>
<dd>

**$moment:** `?Moment` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>$client-&gt;service-&gt;refreshtoken($request)</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```php
$client->service->refreshtoken(
    new RefreshTokenRequest([
        'ttl' => 1,
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

**$ttl:** `int` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

