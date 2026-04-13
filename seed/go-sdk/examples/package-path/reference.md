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

<details><summary><code>client.CreateType(request) -> *pleaseinhere.Identifier</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```go
request := &pleaseinhere.Type{
        BasicType: pleaseinhere.BasicTypePrimitive,
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

**request:** `*pleaseinhere.Type` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## FileNotificationService
<details><summary><code>client.FileNotificationService.FileNotificationServiceGetException(NotificationID) -> *pleaseinhere.Exception</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```go
request := &pleaseinhere.FileNotificationServiceGetExceptionRequest{
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
<details><summary><code>client.FileService.FileServiceGetFile(Filename) -> *pleaseinhere.File</code></summary>
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
request := &pleaseinhere.FileServiceGetFileRequest{
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
request := &pleaseinhere.HealthServiceCheckRequest{
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
<details><summary><code>client.Service.Getmovie(MovieID) -> *pleaseinhere.Movie</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```go
request := &pleaseinhere.ServiceGetMovieRequest{
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

**movieID:** `pleaseinhere.MovieID` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.Service.Createmovie(request) -> pleaseinhere.MovieID</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```go
request := &pleaseinhere.Movie{
        ID: "id",
        Title: "title",
        From: "from",
        Rating: 1.1,
        Type: pleaseinhere.MovieTypeMovie,
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

**request:** `*pleaseinhere.Movie` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.Service.Getmetadata() -> *pleaseinhere.Metadata</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```go
request := &pleaseinhere.ServiceGetMetadataRequest{
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

<details><summary><code>client.Service.Createbigentity(request) -> *pleaseinhere.Response</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```go
request := &pleaseinhere.BigEntity{}
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

**castMember:** `*pleaseinhere.CastMember` 
    
</dd>
</dl>

<dl>
<dd>

**extendedMovie:** `*pleaseinhere.ExtendedMovie` 
    
</dd>
</dl>

<dl>
<dd>

**entity:** `*pleaseinhere.Entity` 
    
</dd>
</dl>

<dl>
<dd>

**metadata:** `*pleaseinhere.Metadata` 
    
</dd>
</dl>

<dl>
<dd>

**commonMetadata:** `*pleaseinhere.CommonsMetadata` 
    
</dd>
</dl>

<dl>
<dd>

**eventInfo:** `*pleaseinhere.CommonsEventInfo` 
    
</dd>
</dl>

<dl>
<dd>

**data:** `*pleaseinhere.CommonsData` 
    
</dd>
</dl>

<dl>
<dd>

**migration:** `*pleaseinhere.Migration` 
    
</dd>
</dl>

<dl>
<dd>

**exception:** `*pleaseinhere.Exception` 
    
</dd>
</dl>

<dl>
<dd>

**test:** `*pleaseinhere.Test` 
    
</dd>
</dl>

<dl>
<dd>

**node:** `*pleaseinhere.Node` 
    
</dd>
</dl>

<dl>
<dd>

**directory:** `*pleaseinhere.Directory` 
    
</dd>
</dl>

<dl>
<dd>

**moment:** `*pleaseinhere.Moment` 
    
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
request := &pleaseinhere.RefreshTokenRequest{
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

