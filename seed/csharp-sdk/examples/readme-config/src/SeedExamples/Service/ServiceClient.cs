using System.Net.Http;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;

namespace SeedExamples;

public partial class ServiceClient
{
    private SeedExamples.Core.RawClient _client;

    internal ServiceClient(SeedExamples.Core.RawClient client)
    {
        _client = client;
    }

    /// <example><code>
    /// await client.Service.GetMovieAsync("movie-c06a4ad7");
    /// </code></example>
    public async Task<SeedExamples.Movie> GetMovieAsync(
        string movieId,
        SeedExamples.RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        var response = await _client
            .SendRequestAsync(
                new SeedExamples.Core.JsonRequest
                {
                    BaseUrl = _client.Options.BaseUrl,
                    Method = HttpMethod.Get,
                    Path = string.Format(
                        "/movie/{0}",
                        SeedExamples.Core.ValueConvert.ToPathParameterString(movieId)
                    ),
                    Options = options,
                },
                cancellationToken
            )
            .ConfigureAwait(false);
        if (response.StatusCode is >= 200 and < 400)
        {
            var responseBody = await response.Raw.Content.ReadAsStringAsync();
            try
            {
                return SeedExamples.Core.JsonUtils.Deserialize<SeedExamples.Movie>(responseBody)!;
            }
            catch (JsonException e)
            {
                throw new SeedExamples.SeedExamplesException("Failed to deserialize response", e);
            }
        }

        {
            var responseBody = await response.Raw.Content.ReadAsStringAsync();
            throw new SeedExamples.SeedExamplesApiException(
                $"Error with status code {response.StatusCode}",
                response.StatusCode,
                responseBody
            );
        }
    }

    /// <example><code>
    /// await client.Service.CreateMovieAsync(
    ///     new SeedExamples.Movie
    ///     {
    ///         Id = "movie-c06a4ad7",
    ///         Prequel = "movie-cv9b914f",
    ///         Title = "The Boy and the Heron",
    ///         From = "Hayao Miyazaki",
    ///         Rating = 8,
    ///         Type = "movie",
    ///         Tag = "tag-wf9as23d",
    ///         Metadata = new Dictionary&lt;string, object&gt;()
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
        SeedExamples.Movie request,
        SeedExamples.RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        var response = await _client
            .SendRequestAsync(
                new SeedExamples.Core.JsonRequest
                {
                    BaseUrl = _client.Options.BaseUrl,
                    Method = HttpMethod.Post,
                    Path = "/movie",
                    Body = request,
                    Options = options,
                },
                cancellationToken
            )
            .ConfigureAwait(false);
        if (response.StatusCode is >= 200 and < 400)
        {
            var responseBody = await response.Raw.Content.ReadAsStringAsync();
            try
            {
                return SeedExamples.Core.JsonUtils.Deserialize<string>(responseBody)!;
            }
            catch (JsonException e)
            {
                throw new SeedExamples.SeedExamplesException("Failed to deserialize response", e);
            }
        }

        {
            var responseBody = await response.Raw.Content.ReadAsStringAsync();
            throw new SeedExamples.SeedExamplesApiException(
                $"Error with status code {response.StatusCode}",
                response.StatusCode,
                responseBody
            );
        }
    }

    /// <example><code>
    /// await client.Service.GetMetadataAsync(
    ///     new SeedExamples.GetMetadataRequest
    ///     {
    ///         Shallow = false,
    ///         Tag = ["development"],
    ///         XApiVersion = "0.0.1",
    ///     }
    /// );
    /// </code></example>
    public async Task<SeedExamples.Metadata> GetMetadataAsync(
        SeedExamples.GetMetadataRequest request,
        SeedExamples.RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        var _query = new Dictionary<string, object>();
        _query["tag"] = request.Tag;
        if (request.Shallow != null)
        {
            _query["shallow"] = SeedExamples.Core.JsonUtils.Serialize(request.Shallow.Value);
        }
        var _headers = new SeedExamples.Core.Headers(
            new Dictionary<string, string>() { { "X-API-Version", request.XApiVersion } }
        );
        var response = await _client
            .SendRequestAsync(
                new SeedExamples.Core.JsonRequest
                {
                    BaseUrl = _client.Options.BaseUrl,
                    Method = HttpMethod.Get,
                    Path = "/metadata",
                    Query = _query,
                    Headers = _headers,
                    Options = options,
                },
                cancellationToken
            )
            .ConfigureAwait(false);
        if (response.StatusCode is >= 200 and < 400)
        {
            var responseBody = await response.Raw.Content.ReadAsStringAsync();
            try
            {
                return SeedExamples.Core.JsonUtils.Deserialize<SeedExamples.Metadata>(
                    responseBody
                )!;
            }
            catch (JsonException e)
            {
                throw new SeedExamples.SeedExamplesException("Failed to deserialize response", e);
            }
        }

        {
            var responseBody = await response.Raw.Content.ReadAsStringAsync();
            throw new SeedExamples.SeedExamplesApiException(
                $"Error with status code {response.StatusCode}",
                response.StatusCode,
                responseBody
            );
        }
    }

    /// <example><code>
    /// await client.Service.CreateBigEntityAsync(
    ///     new SeedExamples.BigEntity
    ///     {
    ///         CastMember = new SeedExamples.Actor { Name = "name", Id = "id" },
    ///         ExtendedMovie = new SeedExamples.ExtendedMovie
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
    ///             Metadata = new Dictionary&lt;string, object&gt;()
    ///             {
    ///                 {
    ///                     "metadata",
    ///                     new Dictionary&lt;object, object?&gt;() { { "key", "value" } }
    ///                 },
    ///             },
    ///             Revenue = 1000000,
    ///         },
    ///         Entity = new SeedExamples.Entity { Type = SeedExamples.BasicType.Primitive, Name = "name" },
    ///         Metadata = new SeedExamples.Metadata(new SeedExamples.Metadata.Html("metadata")),
    ///         CommonMetadata = new SeedExamples.Commons.Metadata
    ///         {
    ///             Id = "id",
    ///             Data = new Dictionary&lt;string, string&gt;() { { "data", "data" } },
    ///             JsonString = "jsonString",
    ///         },
    ///         EventInfo = new SeedExamples.Commons.EventInfo(
    ///             new SeedExamples.Commons.EventInfo.Metadata(
    ///                 new SeedExamples.Commons.Metadata
    ///                 {
    ///                     Id = "id",
    ///                     Data = new Dictionary&lt;string, string&gt;() { { "data", "data" } },
    ///                     JsonString = "jsonString",
    ///                 }
    ///             )
    ///         ),
    ///         Data = new SeedExamples.Commons.Data(new SeedExamples.Commons.Data.String("data")),
    ///         Migration = new SeedExamples.Migration
    ///         {
    ///             Name = "name",
    ///             Status = SeedExamples.MigrationStatus.Running,
    ///         },
    ///         Exception = new SeedExamples.Exception(
    ///             new SeedExamples.Exception.Generic(
    ///                 new SeedExamples.ExceptionInfo
    ///                 {
    ///                     ExceptionType = "exceptionType",
    ///                     ExceptionMessage = "exceptionMessage",
    ///                     ExceptionStacktrace = "exceptionStacktrace",
    ///                 }
    ///             )
    ///         ),
    ///         Test = new SeedExamples.Test(new SeedExamples.Test.And(true)),
    ///         Node = new SeedExamples.Node
    ///         {
    ///             Name = "name",
    ///             Nodes = new List&lt;SeedExamples.Node&gt;()
    ///             {
    ///                 new SeedExamples.Node
    ///                 {
    ///                     Name = "name",
    ///                     Nodes = new List&lt;SeedExamples.Node&gt;()
    ///                     {
    ///                         new SeedExamples.Node
    ///                         {
    ///                             Name = "name",
    ///                             Nodes = new List&lt;SeedExamples.Node&gt;() { },
    ///                             Trees = new List&lt;SeedExamples.Tree&gt;() { },
    ///                         },
    ///                         new SeedExamples.Node
    ///                         {
    ///                             Name = "name",
    ///                             Nodes = new List&lt;SeedExamples.Node&gt;() { },
    ///                             Trees = new List&lt;SeedExamples.Tree&gt;() { },
    ///                         },
    ///                     },
    ///                     Trees = new List&lt;SeedExamples.Tree&gt;()
    ///                     {
    ///                         new SeedExamples.Tree { Nodes = new List&lt;SeedExamples.Node&gt;() { } },
    ///                         new SeedExamples.Tree { Nodes = new List&lt;SeedExamples.Node&gt;() { } },
    ///                     },
    ///                 },
    ///                 new SeedExamples.Node
    ///                 {
    ///                     Name = "name",
    ///                     Nodes = new List&lt;SeedExamples.Node&gt;()
    ///                     {
    ///                         new SeedExamples.Node
    ///                         {
    ///                             Name = "name",
    ///                             Nodes = new List&lt;SeedExamples.Node&gt;() { },
    ///                             Trees = new List&lt;SeedExamples.Tree&gt;() { },
    ///                         },
    ///                         new SeedExamples.Node
    ///                         {
    ///                             Name = "name",
    ///                             Nodes = new List&lt;SeedExamples.Node&gt;() { },
    ///                             Trees = new List&lt;SeedExamples.Tree&gt;() { },
    ///                         },
    ///                     },
    ///                     Trees = new List&lt;SeedExamples.Tree&gt;()
    ///                     {
    ///                         new SeedExamples.Tree { Nodes = new List&lt;SeedExamples.Node&gt;() { } },
    ///                         new SeedExamples.Tree { Nodes = new List&lt;SeedExamples.Node&gt;() { } },
    ///                     },
    ///                 },
    ///             },
    ///             Trees = new List&lt;SeedExamples.Tree&gt;()
    ///             {
    ///                 new SeedExamples.Tree
    ///                 {
    ///                     Nodes = new List&lt;SeedExamples.Node&gt;()
    ///                     {
    ///                         new SeedExamples.Node
    ///                         {
    ///                             Name = "name",
    ///                             Nodes = new List&lt;SeedExamples.Node&gt;() { },
    ///                             Trees = new List&lt;SeedExamples.Tree&gt;() { },
    ///                         },
    ///                         new SeedExamples.Node
    ///                         {
    ///                             Name = "name",
    ///                             Nodes = new List&lt;SeedExamples.Node&gt;() { },
    ///                             Trees = new List&lt;SeedExamples.Tree&gt;() { },
    ///                         },
    ///                     },
    ///                 },
    ///                 new SeedExamples.Tree
    ///                 {
    ///                     Nodes = new List&lt;SeedExamples.Node&gt;()
    ///                     {
    ///                         new SeedExamples.Node
    ///                         {
    ///                             Name = "name",
    ///                             Nodes = new List&lt;SeedExamples.Node&gt;() { },
    ///                             Trees = new List&lt;SeedExamples.Tree&gt;() { },
    ///                         },
    ///                         new SeedExamples.Node
    ///                         {
    ///                             Name = "name",
    ///                             Nodes = new List&lt;SeedExamples.Node&gt;() { },
    ///                             Trees = new List&lt;SeedExamples.Tree&gt;() { },
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
    ///         Moment = new SeedExamples.Moment
    ///         {
    ///             Id = "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32",
    ///             Date = new DateOnly(2023, 1, 15),
    ///             Datetime = new DateTime(2024, 01, 15, 09, 30, 00, 000),
    ///         },
    ///     }
    /// );
    /// </code></example>
    public async Task<SeedExamples.Response> CreateBigEntityAsync(
        SeedExamples.BigEntity request,
        SeedExamples.RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        var response = await _client
            .SendRequestAsync(
                new SeedExamples.Core.JsonRequest
                {
                    BaseUrl = _client.Options.BaseUrl,
                    Method = HttpMethod.Post,
                    Path = "/big-entity",
                    Body = request,
                    Options = options,
                },
                cancellationToken
            )
            .ConfigureAwait(false);
        if (response.StatusCode is >= 200 and < 400)
        {
            var responseBody = await response.Raw.Content.ReadAsStringAsync();
            try
            {
                return SeedExamples.Core.JsonUtils.Deserialize<SeedExamples.Response>(
                    responseBody
                )!;
            }
            catch (JsonException e)
            {
                throw new SeedExamples.SeedExamplesException("Failed to deserialize response", e);
            }
        }

        {
            var responseBody = await response.Raw.Content.ReadAsStringAsync();
            throw new SeedExamples.SeedExamplesApiException(
                $"Error with status code {response.StatusCode}",
                response.StatusCode,
                responseBody
            );
        }
    }

    /// <example><code>
    /// await client.Service.RefreshTokenAsync(null);
    /// </code></example>
    public async Task RefreshTokenAsync(
        SeedExamples.RefreshTokenRequest? request,
        SeedExamples.RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        var response = await _client
            .SendRequestAsync(
                new SeedExamples.Core.JsonRequest
                {
                    BaseUrl = _client.Options.BaseUrl,
                    Method = HttpMethod.Post,
                    Path = "/refresh-token",
                    Body = request,
                    Options = options,
                },
                cancellationToken
            )
            .ConfigureAwait(false);
        if (response.StatusCode is >= 200 and < 400)
        {
            return;
        }
        {
            var responseBody = await response.Raw.Content.ReadAsStringAsync();
            throw new SeedExamples.SeedExamplesApiException(
                $"Error with status code {response.StatusCode}",
                response.StatusCode,
                responseBody
            );
        }
    }
}
