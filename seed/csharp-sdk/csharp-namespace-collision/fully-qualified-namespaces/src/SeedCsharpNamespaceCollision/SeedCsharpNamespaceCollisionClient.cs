using System.Text.Json;
using SeedCsharpNamespaceCollision.Core;
using SeedCsharpNamespaceCollision.System;

namespace SeedCsharpNamespaceCollision;

public partial class SeedCsharpNamespaceCollisionClient : ISeedCsharpNamespaceCollisionClient
{
    private readonly RawClient _client;

    public SeedCsharpNamespaceCollisionClient(ClientOptions? clientOptions = null)
    {
        var defaultHeaders = new Headers(
            new Dictionary<string, string>()
            {
                { "X-Fern-Language", "C#" },
                { "X-Fern-SDK-Name", "SeedCsharpNamespaceCollision" },
                { "X-Fern-SDK-Version", Version.Current },
                { "User-Agent", "Ferncsharp-namespace-collision/0.0.1" },
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
        System = new SystemClient(_client);
    }

    public SystemClient System { get; }

    private async Task<WithRawResponse<User>> CreateUserAsyncCore(
        User request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        var _headers = await new HeadersBuilder.Builder()
            .Add(_client.Options.Headers)
            .Add(_client.Options.AdditionalHeaders)
            .Add(options?.AdditionalHeaders)
            .BuildAsync()
            .ConfigureAwait(false);
        var response = await _client
            .SendRequestAsync(
                new JsonRequest
                {
                    BaseUrl = _client.Options.BaseUrl,
                    Method = HttpMethod.Post,
                    Path = "/users",
                    Body = request,
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
                var responseData = JsonUtils.Deserialize<User>(responseBody)!;
                return new WithRawResponse<User>()
                {
                    Data = responseData,
                    RawResponse = new RawResponse()
                    {
                        StatusCode = response.Raw.StatusCode,
                        Url = response.Raw.RequestMessage?.RequestUri ?? new Uri("about:blank"),
                        Headers = ResponseHeaders.FromHttpResponseMessage(response.Raw),
                    },
                };
            }
            catch (JsonException e)
            {
                throw new SeedCsharpNamespaceCollisionApiException(
                    "Failed to deserialize response",
                    response.StatusCode,
                    responseBody,
                    e
                );
            }
        }
        {
            var responseBody = await response.Raw.Content.ReadAsStringAsync();
            throw new SeedCsharpNamespaceCollisionApiException(
                $"Error with status code {response.StatusCode}",
                response.StatusCode,
                responseBody
            );
        }
    }

    private async Task<WithRawResponse<Task>> CreateTaskAsyncCore(
        Task request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        var _headers = await new HeadersBuilder.Builder()
            .Add(_client.Options.Headers)
            .Add(_client.Options.AdditionalHeaders)
            .Add(options?.AdditionalHeaders)
            .BuildAsync()
            .ConfigureAwait(false);
        var response = await _client
            .SendRequestAsync(
                new JsonRequest
                {
                    BaseUrl = _client.Options.BaseUrl,
                    Method = HttpMethod.Post,
                    Path = "/users",
                    Body = request,
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
                var responseData = JsonUtils.Deserialize<Task>(responseBody)!;
                return new WithRawResponse<Task>()
                {
                    Data = responseData,
                    RawResponse = new RawResponse()
                    {
                        StatusCode = response.Raw.StatusCode,
                        Url = response.Raw.RequestMessage?.RequestUri ?? new Uri("about:blank"),
                        Headers = ResponseHeaders.FromHttpResponseMessage(response.Raw),
                    },
                };
            }
            catch (JsonException e)
            {
                throw new SeedCsharpNamespaceCollisionApiException(
                    "Failed to deserialize response",
                    response.StatusCode,
                    responseBody,
                    e
                );
            }
        }
        {
            var responseBody = await response.Raw.Content.ReadAsStringAsync();
            throw new SeedCsharpNamespaceCollisionApiException(
                $"Error with status code {response.StatusCode}",
                response.StatusCode,
                responseBody
            );
        }
    }

    /// <example><code>
    /// await client.CreateUserAsync(
    ///     new global::SeedCsharpNamespaceCollision.User
    ///     {
    ///         Id = "id",
    ///         Name = "name",
    ///         Email = "email",
    ///         Password = "password",
    ///     }
    /// );
    /// </code></example>
    public WithRawResponseTask<User> CreateUserAsync(
        User request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        return new WithRawResponseTask<User>(
            CreateUserAsyncCore(request, options, cancellationToken)
        );
    }

    /// <example><code>
    /// await client.CreateTaskAsync(
    ///     new global::SeedCsharpNamespaceCollision.Task
    ///     {
    ///         Id = "id",
    ///         Name = "name",
    ///         Email = "email",
    ///         Password = "password",
    ///     }
    /// );
    /// </code></example>
    public WithRawResponseTask<Task> CreateTaskAsync(
        Task request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        return new WithRawResponseTask<Task>(
            CreateTaskAsyncCore(request, options, cancellationToken)
        );
    }
}
