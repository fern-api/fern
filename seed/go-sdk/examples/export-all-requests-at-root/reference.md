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

**request:** `*fern.Type` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## File Notification Service
<details><summary><code>client.File.Notification.Service.GetException(NotificationId) -> *fern.Exception</code></summary>
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
<details><summary><code>client.File.Service.GetFile(Filename) -> *fern.File</code></summary>
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
request := &fern.GetFileRequest{
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
<details><summary><code>client.Service.GetMovie(MovieId) -> *fern.Movie</code></summary>
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

**movieId:** `fern.MovieId` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.Service.CreateMovie(request) -> fern.MovieId</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```go
request := &fern.Movie{
        Id: "movie-c06a4ad7",
        Prequel: fern.String(
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

**request:** `*fern.Movie` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.Service.GetMetadata() -> *fern.Metadata</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```go
request := &fern.GetMetadataRequest{
        Shallow: fern.Bool(
            false,
        ),
        Tag: []*string{
            fern.String(
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

<details><summary><code>client.Service.CreateBigEntity(request) -> *fern.Response</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```go
request := &fern.BigEntity{
        CastMember: &fern.CastMember{
            Actor: &fern.Actor{
                Name: "name",
                Id: "id",
            },
        },
        ExtendedMovie: &fern.ExtendedMovie{
            Cast: []string{
                "cast",
                "cast",
            },
            Id: "id",
            Prequel: fern.String(
                "prequel",
            ),
            Title: "title",
            From: "from",
            Rating: 1.1,
            Tag: "tag",
            Book: fern.String(
                "book",
            ),
            Metadata: map[string]any{
                "metadata": map[string]any{
                    "key": "value",
                },
            },
            Revenue: 1000000,
        },
        Entity: &fern.Entity{
            Type: &fern.Type{
                BasicType: fern.BasicTypePrimitive,
            },
            Name: "name",
        },
        Metadata: &fern.Metadata{
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
            JsonString: fern.String(
                "jsonString",
            ),
        },
        EventInfo: &commons.EventInfo{
            Metadata: &commons.Metadata{
                Id: "id",
                Data: map[string]string{
                    "data": "data",
                },
                JsonString: fern.String(
                    "jsonString",
                ),
            },
        },
        Data: &commons.Data{},
        Migration: &fern.Migration{
            Name: "name",
            Status: fern.MigrationStatusRunning,
        },
        Exception: &fern.Exception{
            Generic: &fern.ExceptionInfo{
                ExceptionType: "exceptionType",
                ExceptionMessage: "exceptionMessage",
                ExceptionStacktrace: "exceptionStacktrace",
            },
        },
        Test: &fern.Test{},
        Node: &fern.Node{
            Name: "name",
            Nodes: []*fern.Node{
                &fern.Node{
                    Name: "name",
                    Nodes: []*fern.Node{
                        &fern.Node{
                            Name: "name",
                            Nodes: []*fern.Node{},
                            Trees: []*fern.Tree{},
                        },
                        &fern.Node{
                            Name: "name",
                            Nodes: []*fern.Node{},
                            Trees: []*fern.Tree{},
                        },
                    },
                    Trees: []*fern.Tree{
                        &fern.Tree{
                            Nodes: []*fern.Node{},
                        },
                        &fern.Tree{
                            Nodes: []*fern.Node{},
                        },
                    },
                },
                &fern.Node{
                    Name: "name",
                    Nodes: []*fern.Node{
                        &fern.Node{
                            Name: "name",
                            Nodes: []*fern.Node{},
                            Trees: []*fern.Tree{},
                        },
                        &fern.Node{
                            Name: "name",
                            Nodes: []*fern.Node{},
                            Trees: []*fern.Tree{},
                        },
                    },
                    Trees: []*fern.Tree{
                        &fern.Tree{
                            Nodes: []*fern.Node{},
                        },
                        &fern.Tree{
                            Nodes: []*fern.Node{},
                        },
                    },
                },
            },
            Trees: []*fern.Tree{
                &fern.Tree{
                    Nodes: []*fern.Node{
                        &fern.Node{
                            Name: "name",
                            Nodes: []*fern.Node{},
                            Trees: []*fern.Tree{},
                        },
                        &fern.Node{
                            Name: "name",
                            Nodes: []*fern.Node{},
                            Trees: []*fern.Tree{},
                        },
                    },
                },
                &fern.Tree{
                    Nodes: []*fern.Node{
                        &fern.Node{
                            Name: "name",
                            Nodes: []*fern.Node{},
                            Trees: []*fern.Tree{},
                        },
                        &fern.Node{
                            Name: "name",
                            Nodes: []*fern.Node{},
                            Trees: []*fern.Tree{},
                        },
                    },
                },
            },
        },
        Directory: &fern.Directory{
            Name: "name",
            Files: []*fern.File{
                &fern.File{
                    Name: "name",
                    Contents: "contents",
                },
                &fern.File{
                    Name: "name",
                    Contents: "contents",
                },
            },
            Directories: []*fern.Directory{
                &fern.Directory{
                    Name: "name",
                    Files: []*fern.File{
                        &fern.File{
                            Name: "name",
                            Contents: "contents",
                        },
                        &fern.File{
                            Name: "name",
                            Contents: "contents",
                        },
                    },
                    Directories: []*fern.Directory{
                        &fern.Directory{
                            Name: "name",
                            Files: []*fern.File{},
                            Directories: []*fern.Directory{},
                        },
                        &fern.Directory{
                            Name: "name",
                            Files: []*fern.File{},
                            Directories: []*fern.Directory{},
                        },
                    },
                },
                &fern.Directory{
                    Name: "name",
                    Files: []*fern.File{
                        &fern.File{
                            Name: "name",
                            Contents: "contents",
                        },
                        &fern.File{
                            Name: "name",
                            Contents: "contents",
                        },
                    },
                    Directories: []*fern.Directory{
                        &fern.Directory{
                            Name: "name",
                            Files: []*fern.File{},
                            Directories: []*fern.Directory{},
                        },
                        &fern.Directory{
                            Name: "name",
                            Files: []*fern.File{},
                            Directories: []*fern.Directory{},
                        },
                    },
                },
            },
        },
        Moment: &fern.Moment{
            Id: uuid.MustParse(
                "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32",
            ),
            Date: fern.MustParseDate(
                "2023-01-15",
            ),
            Datetime: fern.MustParseDateTime(
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

**request:** `*fern.BigEntity` 
    
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

**request:** `*fern.RefreshTokenRequest` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>
