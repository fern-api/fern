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

**request:** `*pleaseinhere.Type` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## File Notification Service
<details><summary><code>client.File.Notification.Service.GetException(NotificationId) -> *pleaseinhere.Exception</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```go
client.File.Notification.Service.GetException(
        context.TODO(),
        "notification-hsy129x",
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

**notificationId:** `string` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## File Service
<details><summary><code>client.File.Service.GetFile(Filename) -> *pleaseinhere.File</code></summary>
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
request := &file.GetFileRequest{
        XFileApiVersion: "0.0.2",
    }
client.File.Service.GetFile(
        context.TODO(),
        "file.txt",
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

## Health Service
<details><summary><code>client.Health.Service.Check(Id) -> error</code></summary>
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
client.Health.Service.Check(
        context.TODO(),
        "id-2sdx82h",
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

<details><summary><code>client.Health.Service.Ping() -> bool</code></summary>
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
client.Health.Service.Ping(
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
<details><summary><code>client.Service.GetMovie(MovieId) -> *pleaseinhere.Movie</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```go
client.Service.GetMovie(
        context.TODO(),
        "movie-c06a4ad7",
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

**movieId:** `pleaseinhere.MovieId` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.Service.CreateMovie(request) -> pleaseinhere.MovieId</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```go
request := &pleaseinhere.Movie{
        Id: "movie-c06a4ad7",
        Prequel: pleaseinhere.String(
            "movie-cv9b914f",
        ),
        Title: "The Boy and the Heron",
        From: "Hayao Miyazaki",
        Rating: 8,
        Tag: "tag-wf9as23d",
        Metadata: map[string]any{
            "actors": []any{
                "Christian Bale",
                "Florence Pugh",
                "Willem Dafoe",
            },
            "releaseDate": "2023-12-08",
            "ratings": map[string]any{
                "rottenTomatoes": 97,
                "imdb": 7.6,
            },
        },
        Revenue: 1000000,
    }
client.Service.CreateMovie(
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

<details><summary><code>client.Service.GetMetadata() -> *pleaseinhere.Metadata</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```go
request := &pleaseinhere.GetMetadataRequest{
        Shallow: pleaseinhere.Bool(
            false,
        ),
        Tag: []*string{
            pleaseinhere.String(
                "development",
            ),
        },
        XApiVersion: "0.0.1",
    }
client.Service.GetMetadata(
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

**xApiVersion:** `string` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.Service.CreateBigEntity(request) -> *pleaseinhere.Response</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```go
request := &pleaseinhere.BigEntity{
        CastMember: &pleaseinhere.CastMember{
            Actor: &pleaseinhere.Actor{
                Name: "name",
                Id: "id",
            },
        },
        ExtendedMovie: &pleaseinhere.ExtendedMovie{
            Cast: []string{
                "cast",
                "cast",
            },
            Id: "id",
            Prequel: pleaseinhere.String(
                "prequel",
            ),
            Title: "title",
            From: "from",
            Rating: 1.1,
            Tag: "tag",
            Book: pleaseinhere.String(
                "book",
            ),
            Metadata: map[string]any{
                "metadata": map[string]any{
                    "key": "value",
                },
            },
            Revenue: 1000000,
        },
        Entity: &pleaseinhere.Entity{
            Type: &pleaseinhere.Type{
                BasicType: pleaseinhere.BasicTypePrimitive,
            },
            Name: "name",
        },
        Metadata: &pleaseinhere.Metadata{
            Extra: map[string]string{
                "extra": "extra",
            },
            Tags: []string{
                "tags",
            },
        },
        CommonMetadata: &commons.Metadata{
            Id: "id",
            Data: map[string]string{
                "data": "data",
            },
            JsonString: pleaseinhere.String(
                "jsonString",
            ),
        },
        EventInfo: &commons.EventInfo{
            Metadata: &commons.Metadata{
                Id: "id",
                Data: map[string]string{
                    "data": "data",
                },
                JsonString: pleaseinhere.String(
                    "jsonString",
                ),
            },
        },
        Data: &commons.Data{},
        Migration: &pleaseinhere.Migration{
            Name: "name",
            Status: pleaseinhere.MigrationStatusRunning,
        },
        Exception: &pleaseinhere.Exception{
            Generic: &pleaseinhere.ExceptionInfo{
                ExceptionType: "exceptionType",
                ExceptionMessage: "exceptionMessage",
                ExceptionStacktrace: "exceptionStacktrace",
            },
        },
        Test: &pleaseinhere.Test{},
        Node: &pleaseinhere.Node{
            Name: "name",
            Nodes: []*pleaseinhere.Node{
                &pleaseinhere.Node{
                    Name: "name",
                    Nodes: []*pleaseinhere.Node{
                        &pleaseinhere.Node{
                            Name: "name",
                            Nodes: []*pleaseinhere.Node{},
                            Trees: []*pleaseinhere.Tree{},
                        },
                        &pleaseinhere.Node{
                            Name: "name",
                            Nodes: []*pleaseinhere.Node{},
                            Trees: []*pleaseinhere.Tree{},
                        },
                    },
                    Trees: []*pleaseinhere.Tree{
                        &pleaseinhere.Tree{
                            Nodes: []*pleaseinhere.Node{},
                        },
                        &pleaseinhere.Tree{
                            Nodes: []*pleaseinhere.Node{},
                        },
                    },
                },
                &pleaseinhere.Node{
                    Name: "name",
                    Nodes: []*pleaseinhere.Node{
                        &pleaseinhere.Node{
                            Name: "name",
                            Nodes: []*pleaseinhere.Node{},
                            Trees: []*pleaseinhere.Tree{},
                        },
                        &pleaseinhere.Node{
                            Name: "name",
                            Nodes: []*pleaseinhere.Node{},
                            Trees: []*pleaseinhere.Tree{},
                        },
                    },
                    Trees: []*pleaseinhere.Tree{
                        &pleaseinhere.Tree{
                            Nodes: []*pleaseinhere.Node{},
                        },
                        &pleaseinhere.Tree{
                            Nodes: []*pleaseinhere.Node{},
                        },
                    },
                },
            },
            Trees: []*pleaseinhere.Tree{
                &pleaseinhere.Tree{
                    Nodes: []*pleaseinhere.Node{
                        &pleaseinhere.Node{
                            Name: "name",
                            Nodes: []*pleaseinhere.Node{},
                            Trees: []*pleaseinhere.Tree{},
                        },
                        &pleaseinhere.Node{
                            Name: "name",
                            Nodes: []*pleaseinhere.Node{},
                            Trees: []*pleaseinhere.Tree{},
                        },
                    },
                },
                &pleaseinhere.Tree{
                    Nodes: []*pleaseinhere.Node{
                        &pleaseinhere.Node{
                            Name: "name",
                            Nodes: []*pleaseinhere.Node{},
                            Trees: []*pleaseinhere.Tree{},
                        },
                        &pleaseinhere.Node{
                            Name: "name",
                            Nodes: []*pleaseinhere.Node{},
                            Trees: []*pleaseinhere.Tree{},
                        },
                    },
                },
            },
        },
        Directory: &pleaseinhere.Directory{
            Name: "name",
            Files: []*pleaseinhere.File{
                &pleaseinhere.File{
                    Name: "name",
                    Contents: "contents",
                },
                &pleaseinhere.File{
                    Name: "name",
                    Contents: "contents",
                },
            },
            Directories: []*pleaseinhere.Directory{
                &pleaseinhere.Directory{
                    Name: "name",
                    Files: []*pleaseinhere.File{
                        &pleaseinhere.File{
                            Name: "name",
                            Contents: "contents",
                        },
                        &pleaseinhere.File{
                            Name: "name",
                            Contents: "contents",
                        },
                    },
                    Directories: []*pleaseinhere.Directory{
                        &pleaseinhere.Directory{
                            Name: "name",
                            Files: []*pleaseinhere.File{},
                            Directories: []*pleaseinhere.Directory{},
                        },
                        &pleaseinhere.Directory{
                            Name: "name",
                            Files: []*pleaseinhere.File{},
                            Directories: []*pleaseinhere.Directory{},
                        },
                    },
                },
                &pleaseinhere.Directory{
                    Name: "name",
                    Files: []*pleaseinhere.File{
                        &pleaseinhere.File{
                            Name: "name",
                            Contents: "contents",
                        },
                        &pleaseinhere.File{
                            Name: "name",
                            Contents: "contents",
                        },
                    },
                    Directories: []*pleaseinhere.Directory{
                        &pleaseinhere.Directory{
                            Name: "name",
                            Files: []*pleaseinhere.File{},
                            Directories: []*pleaseinhere.Directory{},
                        },
                        &pleaseinhere.Directory{
                            Name: "name",
                            Files: []*pleaseinhere.File{},
                            Directories: []*pleaseinhere.Directory{},
                        },
                    },
                },
            },
        },
        Moment: &pleaseinhere.Moment{
            Id: uuid.MustParse(
                "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32",
            ),
            Date: pleaseinhere.MustParseDate(
                "2023-01-15",
            ),
            Datetime: pleaseinhere.MustParseDateTime(
                "2024-01-15T09:30:00Z",
            ),
        },
    }
client.Service.CreateBigEntity(
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

**request:** `*pleaseinhere.BigEntity` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.Service.RefreshToken(request) -> error</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```go
client.Service.RefreshToken(
        context.TODO(),
        nil,
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

**request:** `*pleaseinhere.RefreshTokenRequest` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>
