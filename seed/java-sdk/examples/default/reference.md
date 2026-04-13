# Reference
<details><summary><code>client.echo(request) -> String</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```java
client.echo("string");
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

**request:** `String` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.createType(request) -> Identifier</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```java
client.createType(
    Type.of(BasicType.PRIMITIVE)
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

**request:** `Type` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## FileNotificationService
<details><summary><code>client.fileNotificationService.fileNotificationServiceGetException(notificationId) -> Exception</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```java
client.fileNotificationService().fileNotificationServiceGetException(
    "notificationId",
    FileNotificationServiceGetExceptionRequest
        .builder()
        .build()
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

**notificationId:** `String` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## FileService
<details><summary><code>client.fileService.fileServiceGetFile(filename) -> File</code></summary>
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

```java
client.fileService().fileServiceGetFile(
    "filename",
    FileServiceGetFileRequest
        .builder()
        .build()
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

**filename:** `String` — This is a filename
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## HealthService
<details><summary><code>client.healthService.healthServiceCheck(id)</code></summary>
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

```java
client.healthService().healthServiceCheck(
    "id",
    HealthServiceCheckRequest
        .builder()
        .build()
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

**id:** `String` — The id to check
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.healthService.healthServicePing() -> Boolean</code></summary>
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

```java
client.healthService().healthServicePing();
```
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## Service
<details><summary><code>client.service.getmovie(movieId) -> Movie</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```java
client.service().getmovie(
    "movieId",
    ServiceGetMovieRequest
        .builder()
        .build()
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

**movieId:** `String` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.service.createmovie(request) -> String</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```java
client.service().createmovie(
    Movie
        .builder()
        .id("id")
        .title("title")
        .from("from")
        .rating(1.1)
        .type(MovieType.MOVIE)
        .tag("tag")
        .revenue(1000000L)
        .metadata(
            new HashMap<String, Object>() {{
                put("key", "value");
            }}
        )
        .build()
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

**request:** `Movie` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.service.getmetadata() -> Metadata</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```java
client.service().getmetadata(
    ServiceGetMetadataRequest
        .builder()
        .apiVersion("X-API-Version")
        .build()
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

**shallow:** `Optional<Boolean>` 
    
</dd>
</dl>

<dl>
<dd>

**tag:** `Optional<String>` 
    
</dd>
</dl>

<dl>
<dd>

**apiVersion:** `String` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.service.createbigentity(request) -> Response</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```java
client.service().createbigentity(
    BigEntity
        .builder()
        .build()
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

**castMember:** `Optional<CastMember>` 
    
</dd>
</dl>

<dl>
<dd>

**extendedMovie:** `Optional<ExtendedMovie>` 
    
</dd>
</dl>

<dl>
<dd>

**entity:** `Optional<Entity>` 
    
</dd>
</dl>

<dl>
<dd>

**metadata:** `Optional<Metadata>` 
    
</dd>
</dl>

<dl>
<dd>

**commonMetadata:** `Optional<CommonsMetadata>` 
    
</dd>
</dl>

<dl>
<dd>

**eventInfo:** `Optional<CommonsEventInfo>` 
    
</dd>
</dl>

<dl>
<dd>

**data:** `Optional<CommonsData>` 
    
</dd>
</dl>

<dl>
<dd>

**migration:** `Optional<Migration>` 
    
</dd>
</dl>

<dl>
<dd>

**exception:** `Optional<Exception>` 
    
</dd>
</dl>

<dl>
<dd>

**test:** `Optional<Test>` 
    
</dd>
</dl>

<dl>
<dd>

**node:** `Optional<Node>` 
    
</dd>
</dl>

<dl>
<dd>

**directory:** `Optional<Directory>` 
    
</dd>
</dl>

<dl>
<dd>

**moment:** `Optional<Moment>` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.service.refreshtoken(request)</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```java
client.service().refreshtoken(
    RefreshTokenRequest
        .builder()
        .ttl(1)
        .build()
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

**ttl:** `Integer` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

