using System.Text.Json;
using SeedExamples.Core;

namespace SeedExamples;

public partial class ServiceClient : IServiceClient
{
    private RawClient _client;

    internal ServiceClient(RawClient client)
    {
        _client = client;
        Raw = new RawAccessClient(_client);
    }

    public ServiceClient.RawAccessClient Raw { get; }

    /// <example><code>
    /// await client.Service.GetMovieAsync("movie-c06a4ad7");
    /// </code></example>
    public async Task<Movie> GetMovieAsync(
        string movieId,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        var response = await Raw.GetMovieAsync(movieId, options, cancellationToken);
        return response.Data;
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
        var response = await Raw.CreateMovieAsync(request, options, cancellationToken);
        return response.Data;
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
        var response = await Raw.GetMetadataAsync(request, options, cancellationToken);
        return response.Data;
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
        var response = await Raw.CreateBigEntityAsync(request, options, cancellationToken);
        return response.Data;
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
        await Raw.RefreshTokenAsync(request, options, cancellationToken);
    }

    public partial class RawAccessClient
    {
        private readonly RawClient _client;

        internal RawAccessClient(RawClient client)
        {
            _client = client;
        }

        public async Task<WithRawResponse<Movie>> GetMovieAsync(
            string movieId,
            RequestOptions? options = null,
            CancellationToken cancellationToken = default
        )
        {
            var response = await _client
                .SendRequestAsync(
                    new JsonRequest
                    {
                        BaseUrl = _client.Options.BaseUrl,
                        Method = HttpMethod.Get,
                        Path = string.Format(
                            "/movie/{0}",
                            ValueConvert.ToPathParameterString(movieId)
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
                    var data = JsonUtils.Deserialize<Movie>(responseBody)!;
                    return new WithRawResponse<Movie>
                    {
                        Data = data,
                        RawResponse = new RawResponse
                        {
                            StatusCode = (global::System.Net.HttpStatusCode)response.StatusCode,
                            Url = response.Raw.RequestMessage?.RequestUri!,
                            Headers = ResponseHeaders.FromHttpResponseMessage(response.Raw),
                        },
                    };
                }
                catch (JsonException e)
                {
                    throw new SeedExamplesException("Failed to deserialize response", e);
                }
            }

            {
                var responseBody = await response.Raw.Content.ReadAsStringAsync();
                throw new SeedExamplesApiException(
                    $"Error with status code {response.StatusCode}",
                    response.StatusCode,
                    responseBody
                );
            }
        }

        public async Task<WithRawResponse<string>> CreateMovieAsync(
            Movie request,
            RequestOptions? options = null,
            CancellationToken cancellationToken = default
        )
        {
            var response = await _client
                .SendRequestAsync(
                    new JsonRequest
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
                    var data = JsonUtils.Deserialize<string>(responseBody)!;
                    return new WithRawResponse<string>
                    {
                        Data = data,
                        RawResponse = new RawResponse
                        {
                            StatusCode = (global::System.Net.HttpStatusCode)response.StatusCode,
                            Url = response.Raw.RequestMessage?.RequestUri!,
                            Headers = ResponseHeaders.FromHttpResponseMessage(response.Raw),
                        },
                    };
                }
                catch (JsonException e)
                {
                    throw new SeedExamplesException("Failed to deserialize response", e);
                }
            }

            {
                var responseBody = await response.Raw.Content.ReadAsStringAsync();
                throw new SeedExamplesApiException(
                    $"Error with status code {response.StatusCode}",
                    response.StatusCode,
                    responseBody
                );
            }
        }

        public async Task<WithRawResponse<Metadata>> GetMetadataAsync(
            GetMetadataRequest request,
            RequestOptions? options = null,
            CancellationToken cancellationToken = default
        )
        {
            var _query = new Dictionary<string, object>();
            _query["tag"] = request.Tag;
            if (request.Shallow != null)
            {
                _query["shallow"] = JsonUtils.Serialize(request.Shallow.Value);
            }
            var _headers = new Headers(
                new Dictionary<string, string>() { { "X-API-Version", request.XApiVersion } }
            );
            var response = await _client
                .SendRequestAsync(
                    new JsonRequest
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
                    var data = JsonUtils.Deserialize<Metadata>(responseBody)!;
                    return new WithRawResponse<Metadata>
                    {
                        Data = data,
                        RawResponse = new RawResponse
                        {
                            StatusCode = (global::System.Net.HttpStatusCode)response.StatusCode,
                            Url = response.Raw.RequestMessage?.RequestUri!,
                            Headers = ResponseHeaders.FromHttpResponseMessage(response.Raw),
                        },
                    };
                }
                catch (JsonException e)
                {
                    throw new SeedExamplesException("Failed to deserialize response", e);
                }
            }

            {
                var responseBody = await response.Raw.Content.ReadAsStringAsync();
                throw new SeedExamplesApiException(
                    $"Error with status code {response.StatusCode}",
                    response.StatusCode,
                    responseBody
                );
            }
        }

        public async Task<WithRawResponse<Response>> CreateBigEntityAsync(
            BigEntity request,
            RequestOptions? options = null,
            CancellationToken cancellationToken = default
        )
        {
            var response = await _client
                .SendRequestAsync(
                    new JsonRequest
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
                    var data = JsonUtils.Deserialize<Response>(responseBody)!;
                    return new WithRawResponse<Response>
                    {
                        Data = data,
                        RawResponse = new RawResponse
                        {
                            StatusCode = (global::System.Net.HttpStatusCode)response.StatusCode,
                            Url = response.Raw.RequestMessage?.RequestUri!,
                            Headers = ResponseHeaders.FromHttpResponseMessage(response.Raw),
                        },
                    };
                }
                catch (JsonException e)
                {
                    throw new SeedExamplesException("Failed to deserialize response", e);
                }
            }

            {
                var responseBody = await response.Raw.Content.ReadAsStringAsync();
                throw new SeedExamplesApiException(
                    $"Error with status code {response.StatusCode}",
                    response.StatusCode,
                    responseBody
                );
            }
        }

        public async Task<WithRawResponse<object>> RefreshTokenAsync(
            RefreshTokenRequest? request,
            RequestOptions? options = null,
            CancellationToken cancellationToken = default
        )
        {
            var response = await _client
                .SendRequestAsync(
                    new JsonRequest
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
                return new WithRawResponse<object>
                {
                    Data = new object(),
                    RawResponse = new RawResponse
                    {
                        StatusCode = (global::System.Net.HttpStatusCode)response.StatusCode,
                        Url = response.Raw.RequestMessage?.RequestUri!,
                        Headers = ResponseHeaders.FromHttpResponseMessage(response.Raw),
                    },
                };
            }
            {
                var responseBody = await response.Raw.Content.ReadAsStringAsync();
                throw new SeedExamplesApiException(
                    $"Error with status code {response.StatusCode}",
                    response.StatusCode,
                    responseBody
                );
            }
        }
    }
}
