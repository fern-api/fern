using System.Text.Json;
using SeedCsharpSystemCollision.Core;

namespace SeedCsharpSystemCollision;

public partial class System : ISystem
{
    private readonly RawClient _client;

    public System(ClientOptions? clientOptions = null)
    {
        var defaultHeaders = new Headers(
            new Dictionary<string, string>()
            {
                { "X-Fern-Language", "C#" },
                { "X-Fern-SDK-Name", "SeedCsharpSystemCollision" },
                { "X-Fern-SDK-Version", Version.Current },
                { "User-Agent", "Ferncsharp-system-collision/0.0.1" },
            }
        );
        clientOptions ??= new ClientOptions();
        foreach (var header in defaultHeaders)
        {
            if (!clientOptions.Headers.ContainsKey(header.Key))
            {
                clientOptions.Headers[header.Key] = header.Value;
            }
        }
        _client = new RawClient(clientOptions);
        Raw = new WithRawResponseClient(_client);
    }

    public System.WithRawResponseClient Raw { get; }

    /// <example><code>
    /// await client.CreateUserAsync(
    ///     new User
    ///     {
    ///         Line1 = "line1",
    ///         Line2 = "line2",
    ///         City = "city",
    ///         State = "state",
    ///         Zip = "zip",
    ///         Country = "USA",
    ///     }
    /// );
    /// </code></example>
    public async global::System.Threading.Tasks.Task<User> CreateUserAsync(
        User request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        var response = await Raw.CreateUserAsync(request, options, cancellationToken);
        return response.Data;
    }

    /// <example><code>
    /// await client.CreateTaskAsync(
    ///     new SeedCsharpSystemCollision.Task
    ///     {
    ///         Name = "name",
    ///         User = new User
    ///         {
    ///             Line1 = "line1",
    ///             Line2 = "line2",
    ///             City = "city",
    ///             State = "state",
    ///             Zip = "zip",
    ///             Country = "USA",
    ///         },
    ///     }
    /// );
    /// </code></example>
    public async global::System.Threading.Tasks.Task<Task> CreateTaskAsync(
        Task request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        var response = await Raw.CreateTaskAsync(request, options, cancellationToken);
        return response.Data;
    }

    /// <example><code>
    /// await client.EmptyResponseAsync(
    ///     new SeedCsharpSystemCollision.Task
    ///     {
    ///         Name = "name",
    ///         User = new User
    ///         {
    ///             Line1 = "line1",
    ///             Line2 = "line2",
    ///             City = "city",
    ///             State = "state",
    ///             Zip = "zip",
    ///             Country = "USA",
    ///         },
    ///     }
    /// );
    /// </code></example>
    public async global::System.Threading.Tasks.Task EmptyResponseAsync(
        Task request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        await Raw.EmptyResponseAsync(request, options, cancellationToken);
    }

    public partial class WithRawResponseClient
    {
        private readonly RawClient _client;

        internal WithRawResponseClient(RawClient client)
        {
            _client = client;
        }

        public async global::System.Threading.Tasks.Task<WithRawResponse<User>> CreateUserAsync(
            User request,
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
                        Path = "/users",
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
                    var data = JsonUtils.Deserialize<User>(responseBody)!;
                    return new WithRawResponse<User>
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
                    throw new SystemException("Failed to deserialize response", e);
                }
            }

            {
                var responseBody = await response.Raw.Content.ReadAsStringAsync();
                throw new SystemApiException(
                    $"Error with status code {response.StatusCode}",
                    response.StatusCode,
                    responseBody
                );
            }
        }

        public async global::System.Threading.Tasks.Task<WithRawResponse<Task>> CreateTaskAsync(
            Task request,
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
                        Path = "/users",
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
                    var data = JsonUtils.Deserialize<Task>(responseBody)!;
                    return new WithRawResponse<Task>
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
                    throw new SystemException("Failed to deserialize response", e);
                }
            }

            {
                var responseBody = await response.Raw.Content.ReadAsStringAsync();
                throw new SystemApiException(
                    $"Error with status code {response.StatusCode}",
                    response.StatusCode,
                    responseBody
                );
            }
        }

        public async global::System.Threading.Tasks.Task<
            WithRawResponse<object>
        > EmptyResponseAsync(
            Task request,
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
                        Path = "/users/empty",
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
                throw new SystemApiException(
                    $"Error with status code {response.StatusCode}",
                    response.StatusCode,
                    responseBody
                );
            }
        }
    }
}
