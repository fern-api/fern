# Reference
<details><summary><code>client.Echo(request) -> string</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```go
client.Echo(
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

**request:** `string` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.CreateType(request) -> *fern.Identifier</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```go
request := &fern.Type{
        BasicType: fern.BasicTypePrimitive,
    }
client.CreateType(
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

**request:** `*fern.Type` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## FileNotificationService
<details><summary><code>client.FileNotificationService.FileNotificationServiceGetException(NotificationID) -> *fern.Exception</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```go
request := &fern.FileNotificationServiceGetExceptionRequest{
        NotificationID: "notificationId",
    }
client.FileNotificationService.FileNotificationServiceGetException(
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

**notificationID:** `string` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## FileService
<details><summary><code>client.FileService.FileServiceGetFile(Filename) -> *fern.File</code></summary>
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

```go
request := &fern.FileServiceGetFileRequest{
        Filename: "filename",
    }
client.FileService.FileServiceGetFile(
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

**filename:** `string` — This is a filename
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## HealthService
<details><summary><code>client.HealthService.HealthServiceCheck(ID) -> error</code></summary>
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

```go
request := &fern.HealthServiceCheckRequest{
        ID: "id",
    }
client.HealthService.HealthServiceCheck(
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

**id:** `string` — The id to check
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.HealthService.HealthServicePing() -> bool</code></summary>
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

```go
client.HealthService.HealthServicePing(
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

## Service
<details><summary><code>client.Service.Getmovie(MovieID) -> *fern.Movie</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```go
request := &fern.ServiceGetMovieRequest{
        MovieID: "movieId",
    }
client.Service.Getmovie(
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

**movieID:** `fern.MovieID` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.Service.Createmovie(request) -> fern.MovieID</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```go
request := &fern.Movie{
        ID: "id",
        Title: "title",
        From: "from",
        Rating: 1.1,
        Type: fern.MovieTypeMovie,
        Tag: "tag",
        Metadata: map[string]any{
            "key": "value",
        },
        Revenue: int64(1000000),
    }
client.Service.Createmovie(
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

**request:** `*fern.Movie` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.Service.Getmetadata() -> *fern.Metadata</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```go
request := &fern.ServiceGetMetadataRequest{
        APIVersion: "X-API-Version",
    }
client.Service.Getmetadata(
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

**shallow:** `*bool` 
    
</dd>
</dl>

<dl>
<dd>

**tag:** `*string` 
    
</dd>
</dl>

<dl>
<dd>

**apiVersion:** `string` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.Service.Createbigentity(request) -> *fern.Response</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```go
request := &fern.BigEntity{}
client.Service.Createbigentity(
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

**castMember:** `*fern.CastMember` 
    
</dd>
</dl>

<dl>
<dd>

**extendedMovie:** `*fern.ExtendedMovie` 
    
</dd>
</dl>

<dl>
<dd>

**entity:** `*fern.Entity` 
    
</dd>
</dl>

<dl>
<dd>

**metadata:** `*fern.Metadata` 
    
</dd>
</dl>

<dl>
<dd>

**commonMetadata:** `*fern.CommonsMetadata` 
    
</dd>
</dl>

<dl>
<dd>

**eventInfo:** `*fern.CommonsEventInfo` 
    
</dd>
</dl>

<dl>
<dd>

**data:** `*fern.CommonsData` 
    
</dd>
</dl>

<dl>
<dd>

**migration:** `*fern.Migration` 
    
</dd>
</dl>

<dl>
<dd>

**exception:** `*fern.Exception` 
    
</dd>
</dl>

<dl>
<dd>

**test:** `*fern.Test` 
    
</dd>
</dl>

<dl>
<dd>

**node:** `*fern.Node` 
    
</dd>
</dl>

<dl>
<dd>

**directory:** `*fern.Directory` 
    
</dd>
</dl>

<dl>
<dd>

**moment:** `*fern.Moment` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.Service.Refreshtoken(request) -> error</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```go
request := &fern.RefreshTokenRequest{
        TTL: 1,
    }
client.Service.Refreshtoken(
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

**ttl:** `int` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

