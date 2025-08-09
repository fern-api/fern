# Reference
<details><summary><code>client.<a href="/src/SeedExamples/SeedExamplesClient.cs">EchoAsync</a>(string { ... }) -> string</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
await client.EchoAsync("Hello world!\\n\\nwith\\n\\tnewlines");
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

<details><summary><code>client.<a href="/src/SeedExamples/SeedExamplesClient.cs">CreateTypeAsync</a>(OneOf<SeedExamples.BasicType, SeedExamples.ComplexType> { ... }) -> SeedExamples.Identifier</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
await client.CreateTypeAsync(SeedExamples.BasicType.Primitive);
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

**request:** `OneOf<SeedExamples.BasicType, SeedExamples.ComplexType>` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## File Notification Service
<details><summary><code>client.File.Notification.Service.<a href="/src/SeedExamples/File/Notification/Service/ServiceClient.cs">GetExceptionAsync</a>(notificationId) -> SeedExamples.Exception</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
await client.File.Notification.Service.GetExceptionAsync("notification-hsy129x");
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
<details><summary><code>client.File.Service.<a href="/src/SeedExamples/File/Service/ServiceClient.cs">GetFileAsync</a>(filename, SeedExamples.File.GetFileRequest { ... }) -> SeedExamples.File</code></summary>
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

```csharp
await client.File.Service.GetFileAsync(
    "file.txt",
    new SeedExamples.File.GetFileRequest { XFileApiVersion = "0.0.2" }
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

**filename:** `string` — This is a filename
    
</dd>
</dl>

<dl>
<dd>

**request:** `SeedExamples.File.GetFileRequest` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## Health Service
<details><summary><code>client.Health.Service.<a href="/src/SeedExamples/Health/Service/ServiceClient.cs">CheckAsync</a>(id)</code></summary>
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

```csharp
await client.Health.Service.CheckAsync("id-2sdx82h");
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

<details><summary><code>client.Health.Service.<a href="/src/SeedExamples/Health/Service/ServiceClient.cs">PingAsync</a>() -> bool</code></summary>
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

```csharp
await client.Health.Service.PingAsync();
```
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## Service
<details><summary><code>client.Service.<a href="/src/SeedExamples/Service/ServiceClient.cs">GetMovieAsync</a>(movieId) -> SeedExamples.Movie</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
await client.Service.GetMovieAsync("movie-c06a4ad7");
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

**movieId:** `string` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.Service.<a href="/src/SeedExamples/Service/ServiceClient.cs">CreateMovieAsync</a>(SeedExamples.Movie { ... }) -> string</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
await client.Service.CreateMovieAsync(
    new SeedExamples.Movie
    {
        Id = "movie-c06a4ad7",
        Prequel = "movie-cv9b914f",
        Title = "The Boy and the Heron",
        From = "Hayao Miyazaki",
        Rating = 8,
        Type = "movie",
        Tag = "tag-wf9as23d",
        Metadata = new Dictionary<string, object>()
        {
            {
                "actors",
                new List<object?>() { "Christian Bale", "Florence Pugh", "Willem Dafoe" }
            },
            { "releaseDate", "2023-12-08" },
            {
                "ratings",
                new Dictionary<object, object?>() { { "imdb", 7.6 }, { "rottenTomatoes", 97 } }
            },
        },
        Revenue = 1000000,
    }
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

**request:** `SeedExamples.Movie` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.Service.<a href="/src/SeedExamples/Service/ServiceClient.cs">GetMetadataAsync</a>(SeedExamples.GetMetadataRequest { ... }) -> SeedExamples.Metadata</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
await client.Service.GetMetadataAsync(
    new SeedExamples.GetMetadataRequest
    {
        Shallow = false,
        Tag = ["development"],
        XApiVersion = "0.0.1",
    }
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

**request:** `SeedExamples.GetMetadataRequest` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.Service.<a href="/src/SeedExamples/Service/ServiceClient.cs">CreateBigEntityAsync</a>(SeedExamples.BigEntity { ... }) -> SeedExamples.Response</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
await client.Service.CreateBigEntityAsync(
    new SeedExamples.BigEntity
    {
        CastMember = new SeedExamples.Actor { Name = "name", Id = "id" },
        ExtendedMovie = new SeedExamples.ExtendedMovie
        {
            Cast = new List<string>() { "cast", "cast" },
            Id = "id",
            Prequel = "prequel",
            Title = "title",
            From = "from",
            Rating = 1.1,
            Type = "movie",
            Tag = "tag",
            Book = "book",
            Metadata = new Dictionary<string, object>()
            {
                {
                    "metadata",
                    new Dictionary<object, object?>() { { "key", "value" } }
                },
            },
            Revenue = 1000000,
        },
        Entity = new SeedExamples.Entity { Type = SeedExamples.BasicType.Primitive, Name = "name" },
        Metadata = new SeedExamples.Metadata(new SeedExamples.Metadata.Html("metadata")),
        CommonMetadata = new SeedExamples.Commons.Metadata
        {
            Id = "id",
            Data = new Dictionary<string, string>() { { "data", "data" } },
            JsonString = "jsonString",
        },
        EventInfo = new SeedExamples.Commons.EventInfo(
            new SeedExamples.Commons.EventInfo.Metadata(
                new SeedExamples.Commons.Metadata
                {
                    Id = "id",
                    Data = new Dictionary<string, string>() { { "data", "data" } },
                    JsonString = "jsonString",
                }
            )
        ),
        Data = new SeedExamples.Commons.Data(new SeedExamples.Commons.Data.String("data")),
        Migration = new SeedExamples.Migration
        {
            Name = "name",
            Status = SeedExamples.MigrationStatus.Running,
        },
        Exception = new SeedExamples.Exception(
            new SeedExamples.Exception.Generic(
                new SeedExamples.ExceptionInfo
                {
                    ExceptionType = "exceptionType",
                    ExceptionMessage = "exceptionMessage",
                    ExceptionStacktrace = "exceptionStacktrace",
                }
            )
        ),
        Test = new SeedExamples.Test(new SeedExamples.Test.And(true)),
        Node = new SeedExamples.Node
        {
            Name = "name",
            Nodes = new List<SeedExamples.Node>()
            {
                new SeedExamples.Node
                {
                    Name = "name",
                    Nodes = new List<SeedExamples.Node>()
                    {
                        new SeedExamples.Node
                        {
                            Name = "name",
                            Nodes = new List<SeedExamples.Node>() { },
                            Trees = new List<SeedExamples.Tree>() { },
                        },
                        new SeedExamples.Node
                        {
                            Name = "name",
                            Nodes = new List<SeedExamples.Node>() { },
                            Trees = new List<SeedExamples.Tree>() { },
                        },
                    },
                    Trees = new List<SeedExamples.Tree>()
                    {
                        new SeedExamples.Tree { Nodes = new List<SeedExamples.Node>() { } },
                        new SeedExamples.Tree { Nodes = new List<SeedExamples.Node>() { } },
                    },
                },
                new SeedExamples.Node
                {
                    Name = "name",
                    Nodes = new List<SeedExamples.Node>()
                    {
                        new SeedExamples.Node
                        {
                            Name = "name",
                            Nodes = new List<SeedExamples.Node>() { },
                            Trees = new List<SeedExamples.Tree>() { },
                        },
                        new SeedExamples.Node
                        {
                            Name = "name",
                            Nodes = new List<SeedExamples.Node>() { },
                            Trees = new List<SeedExamples.Tree>() { },
                        },
                    },
                    Trees = new List<SeedExamples.Tree>()
                    {
                        new SeedExamples.Tree { Nodes = new List<SeedExamples.Node>() { } },
                        new SeedExamples.Tree { Nodes = new List<SeedExamples.Node>() { } },
                    },
                },
            },
            Trees = new List<SeedExamples.Tree>()
            {
                new SeedExamples.Tree
                {
                    Nodes = new List<SeedExamples.Node>()
                    {
                        new SeedExamples.Node
                        {
                            Name = "name",
                            Nodes = new List<SeedExamples.Node>() { },
                            Trees = new List<SeedExamples.Tree>() { },
                        },
                        new SeedExamples.Node
                        {
                            Name = "name",
                            Nodes = new List<SeedExamples.Node>() { },
                            Trees = new List<SeedExamples.Tree>() { },
                        },
                    },
                },
                new SeedExamples.Tree
                {
                    Nodes = new List<SeedExamples.Node>()
                    {
                        new SeedExamples.Node
                        {
                            Name = "name",
                            Nodes = new List<SeedExamples.Node>() { },
                            Trees = new List<SeedExamples.Tree>() { },
                        },
                        new SeedExamples.Node
                        {
                            Name = "name",
                            Nodes = new List<SeedExamples.Node>() { },
                            Trees = new List<SeedExamples.Tree>() { },
                        },
                    },
                },
            },
        },
        Directory = new SeedExamples.Directory
        {
            Name = "name",
            Files = new List<SeedExamples.File>()
            {
                new SeedExamples.File { Name = "name", Contents = "contents" },
                new SeedExamples.File { Name = "name", Contents = "contents" },
            },
            Directories = new List<SeedExamples.Directory>()
            {
                new SeedExamples.Directory
                {
                    Name = "name",
                    Files = new List<SeedExamples.File>()
                    {
                        new SeedExamples.File { Name = "name", Contents = "contents" },
                        new SeedExamples.File { Name = "name", Contents = "contents" },
                    },
                    Directories = new List<SeedExamples.Directory>()
                    {
                        new SeedExamples.Directory
                        {
                            Name = "name",
                            Files = new List<SeedExamples.File>() { },
                            Directories = new List<SeedExamples.Directory>() { },
                        },
                        new SeedExamples.Directory
                        {
                            Name = "name",
                            Files = new List<SeedExamples.File>() { },
                            Directories = new List<SeedExamples.Directory>() { },
                        },
                    },
                },
                new SeedExamples.Directory
                {
                    Name = "name",
                    Files = new List<SeedExamples.File>()
                    {
                        new SeedExamples.File { Name = "name", Contents = "contents" },
                        new SeedExamples.File { Name = "name", Contents = "contents" },
                    },
                    Directories = new List<SeedExamples.Directory>()
                    {
                        new SeedExamples.Directory
                        {
                            Name = "name",
                            Files = new List<SeedExamples.File>() { },
                            Directories = new List<SeedExamples.Directory>() { },
                        },
                        new SeedExamples.Directory
                        {
                            Name = "name",
                            Files = new List<SeedExamples.File>() { },
                            Directories = new List<SeedExamples.Directory>() { },
                        },
                    },
                },
            },
        },
        Moment = new SeedExamples.Moment
        {
            Id = "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32",
            Date = new DateOnly(2023, 1, 15),
            Datetime = new DateTime(2024, 01, 15, 09, 30, 00, 000),
        },
    }
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

**request:** `SeedExamples.BigEntity` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.Service.<a href="/src/SeedExamples/Service/ServiceClient.cs">RefreshTokenAsync</a>(SeedExamples.RefreshTokenRequest? { ... })</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
await client.Service.RefreshTokenAsync(null);
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

**request:** `SeedExamples.RefreshTokenRequest?` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>
