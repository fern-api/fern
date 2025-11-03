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

<details><summary><code>client.<a href="/src/SeedExamples/SeedExamplesClient.cs">CreateTypeAsync</a>(OneOf<BasicType, ComplexType> { ... }) -> Identifier</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
await client.CreateTypeAsync(BasicType.Primitive);
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

**request:** `OneOf<BasicType, ComplexType>` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## File Notification Service
<details><summary><code>client.File.Notification.Service.<a href="/src/SeedExamples/File/Notification/Service/ServiceClient.cs">GetExceptionAsync</a>(notificationId) -> Exception</code></summary>
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
<details><summary><code>client.File.Service.<a href="/src/SeedExamples/File/Service/ServiceClient.cs">GetFileAsync</a>(filename, GetFileRequest { ... }) -> File</code></summary>
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
    new GetFileRequest { XFileApiVersion = "0.0.2" }
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

**request:** `GetFileRequest` 
    
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
<details><summary><code>client.Service.<a href="/src/SeedExamples/Service/ServiceClient.cs">GetMovieAsync</a>(movieId) -> Movie</code></summary>
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

<details><summary><code>client.Service.<a href="/src/SeedExamples/Service/ServiceClient.cs">CreateMovieAsync</a>(Movie { ... }) -> string</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
await client.Service.CreateMovieAsync(
    new Movie
    {
        Id = "movie-c06a4ad7",
        Prequel = "movie-cv9b914f",
        Title = "The Boy and the Heron",
        From = "Hayao Miyazaki",
        Rating = 8,
        Type = "movie",
        Tag = "tag-wf9as23d",
        Metadata = new Dictionary<string, object?>()
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

**request:** `Movie` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.Service.<a href="/src/SeedExamples/Service/ServiceClient.cs">GetMetadataAsync</a>(GetMetadataRequest { ... }) -> Metadata</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
await client.Service.GetMetadataAsync(
    new GetMetadataRequest
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

**request:** `GetMetadataRequest` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.Service.<a href="/src/SeedExamples/Service/ServiceClient.cs">CreateBigEntityAsync</a>(BigEntity { ... }) -> Response</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
await client.Service.CreateBigEntityAsync(
    new BigEntity
    {
        CastMember = new Actor { Name = "name", Id = "id" },
        ExtendedMovie = new ExtendedMovie
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
            Metadata = new Dictionary<string, object?>()
            {
                {
                    "metadata",
                    new Dictionary<object, object?>() { { "key", "value" } }
                },
            },
            Revenue = 1000000,
        },
        Entity = new Entity { Type = BasicType.Primitive, Name = "name" },
        Metadata = new SeedExamples.Metadata(new SeedExamples.Metadata.Html("metadata")),
        CommonMetadata = new SeedExamples.Commons.Metadata
        {
            Id = "id",
            Data = new Dictionary<string, string>() { { "data", "data" } },
            JsonString = "jsonString",
        },
        EventInfo = new EventInfo(
            new SeedExamples.Commons.EventInfo.Metadata(
                new SeedExamples.Commons.Metadata
                {
                    Id = "id",
                    Data = new Dictionary<string, string>() { { "data", "data" } },
                    JsonString = "jsonString",
                }
            )
        ),
        Data = new Data(new Data.String("data")),
        Migration = new Migration { Name = "name", Status = MigrationStatus.Running },
        Exception = new SeedExamples.Exception(
            new SeedExamples.Exception.Generic(
                new ExceptionInfo
                {
                    ExceptionType = "exceptionType",
                    ExceptionMessage = "exceptionMessage",
                    ExceptionStacktrace = "exceptionStacktrace",
                }
            )
        ),
        Test = new Test(new Test.And(true)),
        Node = new Node
        {
            Name = "name",
            Nodes = new List<Node>()
            {
                new Node
                {
                    Name = "name",
                    Nodes = new List<Node>()
                    {
                        new Node
                        {
                            Name = "name",
                            Nodes = new List<Node>() { },
                            Trees = new List<Tree>() { },
                        },
                        new Node
                        {
                            Name = "name",
                            Nodes = new List<Node>() { },
                            Trees = new List<Tree>() { },
                        },
                    },
                    Trees = new List<Tree>()
                    {
                        new Tree { Nodes = new List<Node>() { } },
                        new Tree { Nodes = new List<Node>() { } },
                    },
                },
                new Node
                {
                    Name = "name",
                    Nodes = new List<Node>()
                    {
                        new Node
                        {
                            Name = "name",
                            Nodes = new List<Node>() { },
                            Trees = new List<Tree>() { },
                        },
                        new Node
                        {
                            Name = "name",
                            Nodes = new List<Node>() { },
                            Trees = new List<Tree>() { },
                        },
                    },
                    Trees = new List<Tree>()
                    {
                        new Tree { Nodes = new List<Node>() { } },
                        new Tree { Nodes = new List<Node>() { } },
                    },
                },
            },
            Trees = new List<Tree>()
            {
                new Tree
                {
                    Nodes = new List<Node>()
                    {
                        new Node
                        {
                            Name = "name",
                            Nodes = new List<Node>() { },
                            Trees = new List<Tree>() { },
                        },
                        new Node
                        {
                            Name = "name",
                            Nodes = new List<Node>() { },
                            Trees = new List<Tree>() { },
                        },
                    },
                },
                new Tree
                {
                    Nodes = new List<Node>()
                    {
                        new Node
                        {
                            Name = "name",
                            Nodes = new List<Node>() { },
                            Trees = new List<Tree>() { },
                        },
                        new Node
                        {
                            Name = "name",
                            Nodes = new List<Node>() { },
                            Trees = new List<Tree>() { },
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
        Moment = new Moment
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

**request:** `BigEntity` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.Service.<a href="/src/SeedExamples/Service/ServiceClient.cs">RefreshTokenAsync</a>(RefreshTokenRequest? { ... })</code></summary>
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

**request:** `RefreshTokenRequest?` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>
