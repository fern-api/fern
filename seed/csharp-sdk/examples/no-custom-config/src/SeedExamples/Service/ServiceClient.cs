using SeedExamples.Core;

namespace SeedExamples;

public partial class ServiceClient
{
    private RawClient _client;

    private RawServiceClient _rawClient;

    internal ServiceClient(RawClient client)
    {
        _client = client;
        _rawClient = new RawServiceClient(_client);
        WithRawResponse = _rawClient;
    }

    /// <summary>
    /// Access endpoints with raw HTTP response data (status code, headers).
    /// </summary>
    public RawServiceClient WithRawResponse { get; }

    /// <example><code>
    /// await client.Service.GetMovieAsync("movie-c06a4ad7");
    /// </code></example>
    public async Task<Movie> GetMovieAsync(
        string movieId,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        return (
            await WithRawResponse
                .GetMovieAsync(movieId, options, cancellationToken)
                .ConfigureAwait(false)
        ).Body;
    }

    /// <example><code>
    /// await client.Service.CreateMovieAsync(
    ///     new Movie
    ///     {
    ///         Id = "movie-c06a4ad7",
    ///         Prequel = "movie-cv9b914f",
    ///         Title = "The Boy and the Heron",
    ///         From = "Hayao Miyazaki",
    ///         Rating = 8,
    ///         Type = "movie",
    ///         Tag = "tag-wf9as23d",
    ///         Metadata = new Dictionary&lt;string, object?&gt;()
    ///         {
    ///             {
    ///                 "actors",
    ///                 new List&lt;object?&gt;() { "Christian Bale", "Florence Pugh", "Willem Dafoe" }
    ///             },
    ///             { "releaseDate", "2023-12-08" },
    ///             {
    ///                 "ratings",
    ///                 new Dictionary&lt;object, object?&gt;() { { "imdb", 7.6 }, { "rottenTomatoes", 97 } }
    ///             },
    ///         },
    ///         Revenue = 1000000,
    ///     }
    /// );
    /// </code></example>
    public async Task<string> CreateMovieAsync(
        Movie request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        return (
            await WithRawResponse
                .CreateMovieAsync(request, options, cancellationToken)
                .ConfigureAwait(false)
        ).Body;
    }

    /// <example><code>
    /// await client.Service.GetMetadataAsync(
    ///     new GetMetadataRequest
    ///     {
    ///         Shallow = false,
    ///         Tag = ["development"],
    ///         XApiVersion = "0.0.1",
    ///     }
    /// );
    /// </code></example>
    public async Task<Metadata> GetMetadataAsync(
        GetMetadataRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        return (
            await WithRawResponse
                .GetMetadataAsync(request, options, cancellationToken)
                .ConfigureAwait(false)
        ).Body;
    }

    /// <example><code>
    /// await client.Service.CreateBigEntityAsync(
    ///     new BigEntity
    ///     {
    ///         CastMember = new Actor { Name = "name", Id = "id" },
    ///         ExtendedMovie = new ExtendedMovie
    ///         {
    ///             Cast = new List&lt;string&gt;() { "cast", "cast" },
    ///             Id = "id",
    ///             Prequel = "prequel",
    ///             Title = "title",
    ///             From = "from",
    ///             Rating = 1.1,
    ///             Type = "movie",
    ///             Tag = "tag",
    ///             Book = "book",
    ///             Metadata = new Dictionary&lt;string, object?&gt;()
    ///             {
    ///                 {
    ///                     "metadata",
    ///                     new Dictionary&lt;object, object?&gt;() { { "key", "value" } }
    ///                 },
    ///             },
    ///             Revenue = 1000000,
    ///         },
    ///         Entity = new Entity { Type = BasicType.Primitive, Name = "name" },
    ///         Metadata = new SeedExamples.Metadata(new SeedExamples.Metadata.Html("metadata")),
    ///         CommonMetadata = new SeedExamples.Commons.Metadata
    ///         {
    ///             Id = "id",
    ///             Data = new Dictionary&lt;string, string&gt;() { { "data", "data" } },
    ///             JsonString = "jsonString",
    ///         },
    ///         EventInfo = new EventInfo(
    ///             new SeedExamples.Commons.EventInfo.Metadata(
    ///                 new SeedExamples.Commons.Metadata
    ///                 {
    ///                     Id = "id",
    ///                     Data = new Dictionary&lt;string, string&gt;() { { "data", "data" } },
    ///                     JsonString = "jsonString",
    ///                 }
    ///             )
    ///         ),
    ///         Data = new Data(new Data.String("data")),
    ///         Migration = new Migration { Name = "name", Status = MigrationStatus.Running },
    ///         Exception = new SeedExamples.Exception(
    ///             new SeedExamples.Exception.Generic(
    ///                 new ExceptionInfo
    ///                 {
    ///                     ExceptionType = "exceptionType",
    ///                     ExceptionMessage = "exceptionMessage",
    ///                     ExceptionStacktrace = "exceptionStacktrace",
    ///                 }
    ///             )
    ///         ),
    ///         Test = new Test(new Test.And(true)),
    ///         Node = new Node
    ///         {
    ///             Name = "name",
    ///             Nodes = new List&lt;Node&gt;()
    ///             {
    ///                 new Node
    ///                 {
    ///                     Name = "name",
    ///                     Nodes = new List&lt;Node&gt;()
    ///                     {
    ///                         new Node
    ///                         {
    ///                             Name = "name",
    ///                             Nodes = new List&lt;Node&gt;() { },
    ///                             Trees = new List&lt;Tree&gt;() { },
    ///                         },
    ///                         new Node
    ///                         {
    ///                             Name = "name",
    ///                             Nodes = new List&lt;Node&gt;() { },
    ///                             Trees = new List&lt;Tree&gt;() { },
    ///                         },
    ///                     },
    ///                     Trees = new List&lt;Tree&gt;()
    ///                     {
    ///                         new Tree { Nodes = new List&lt;Node&gt;() { } },
    ///                         new Tree { Nodes = new List&lt;Node&gt;() { } },
    ///                     },
    ///                 },
    ///                 new Node
    ///                 {
    ///                     Name = "name",
    ///                     Nodes = new List&lt;Node&gt;()
    ///                     {
    ///                         new Node
    ///                         {
    ///                             Name = "name",
    ///                             Nodes = new List&lt;Node&gt;() { },
    ///                             Trees = new List&lt;Tree&gt;() { },
    ///                         },
    ///                         new Node
    ///                         {
    ///                             Name = "name",
    ///                             Nodes = new List&lt;Node&gt;() { },
    ///                             Trees = new List&lt;Tree&gt;() { },
    ///                         },
    ///                     },
    ///                     Trees = new List&lt;Tree&gt;()
    ///                     {
    ///                         new Tree { Nodes = new List&lt;Node&gt;() { } },
    ///                         new Tree { Nodes = new List&lt;Node&gt;() { } },
    ///                     },
    ///                 },
    ///             },
    ///             Trees = new List&lt;Tree&gt;()
    ///             {
    ///                 new Tree
    ///                 {
    ///                     Nodes = new List&lt;Node&gt;()
    ///                     {
    ///                         new Node
    ///                         {
    ///                             Name = "name",
    ///                             Nodes = new List&lt;Node&gt;() { },
    ///                             Trees = new List&lt;Tree&gt;() { },
    ///                         },
    ///                         new Node
    ///                         {
    ///                             Name = "name",
    ///                             Nodes = new List&lt;Node&gt;() { },
    ///                             Trees = new List&lt;Tree&gt;() { },
    ///                         },
    ///                     },
    ///                 },
    ///                 new Tree
    ///                 {
    ///                     Nodes = new List&lt;Node&gt;()
    ///                     {
    ///                         new Node
    ///                         {
    ///                             Name = "name",
    ///                             Nodes = new List&lt;Node&gt;() { },
    ///                             Trees = new List&lt;Tree&gt;() { },
    ///                         },
    ///                         new Node
    ///                         {
    ///                             Name = "name",
    ///                             Nodes = new List&lt;Node&gt;() { },
    ///                             Trees = new List&lt;Tree&gt;() { },
    ///                         },
    ///                     },
    ///                 },
    ///             },
    ///         },
    ///         Directory = new SeedExamples.Directory
    ///         {
    ///             Name = "name",
    ///             Files = new List&lt;SeedExamples.File&gt;()
    ///             {
    ///                 new SeedExamples.File { Name = "name", Contents = "contents" },
    ///                 new SeedExamples.File { Name = "name", Contents = "contents" },
    ///             },
    ///             Directories = new List&lt;SeedExamples.Directory&gt;()
    ///             {
    ///                 new SeedExamples.Directory
    ///                 {
    ///                     Name = "name",
    ///                     Files = new List&lt;SeedExamples.File&gt;()
    ///                     {
    ///                         new SeedExamples.File { Name = "name", Contents = "contents" },
    ///                         new SeedExamples.File { Name = "name", Contents = "contents" },
    ///                     },
    ///                     Directories = new List&lt;SeedExamples.Directory&gt;()
    ///                     {
    ///                         new SeedExamples.Directory
    ///                         {
    ///                             Name = "name",
    ///                             Files = new List&lt;SeedExamples.File&gt;() { },
    ///                             Directories = new List&lt;SeedExamples.Directory&gt;() { },
    ///                         },
    ///                         new SeedExamples.Directory
    ///                         {
    ///                             Name = "name",
    ///                             Files = new List&lt;SeedExamples.File&gt;() { },
    ///                             Directories = new List&lt;SeedExamples.Directory&gt;() { },
    ///                         },
    ///                     },
    ///                 },
    ///                 new SeedExamples.Directory
    ///                 {
    ///                     Name = "name",
    ///                     Files = new List&lt;SeedExamples.File&gt;()
    ///                     {
    ///                         new SeedExamples.File { Name = "name", Contents = "contents" },
    ///                         new SeedExamples.File { Name = "name", Contents = "contents" },
    ///                     },
    ///                     Directories = new List&lt;SeedExamples.Directory&gt;()
    ///                     {
    ///                         new SeedExamples.Directory
    ///                         {
    ///                             Name = "name",
    ///                             Files = new List&lt;SeedExamples.File&gt;() { },
    ///                             Directories = new List&lt;SeedExamples.Directory&gt;() { },
    ///                         },
    ///                         new SeedExamples.Directory
    ///                         {
    ///                             Name = "name",
    ///                             Files = new List&lt;SeedExamples.File&gt;() { },
    ///                             Directories = new List&lt;SeedExamples.Directory&gt;() { },
    ///                         },
    ///                     },
    ///                 },
    ///             },
    ///         },
    ///         Moment = new Moment
    ///         {
    ///             Id = "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32",
    ///             Date = new DateOnly(2023, 1, 15),
    ///             Datetime = new DateTime(2024, 01, 15, 09, 30, 00, 000),
    ///         },
    ///     }
    /// );
    /// </code></example>
    public async Task<Response> CreateBigEntityAsync(
        BigEntity request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        return (
            await WithRawResponse
                .CreateBigEntityAsync(request, options, cancellationToken)
                .ConfigureAwait(false)
        ).Body;
    }

    /// <example><code>
    /// await client.Service.RefreshTokenAsync(null);
    /// </code></example>
    public async Task RefreshTokenAsync(
        RefreshTokenRequest? request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        await WithRawResponse
            .RefreshTokenAsync(request, options, cancellationToken)
            .ConfigureAwait(false);
    }
}
