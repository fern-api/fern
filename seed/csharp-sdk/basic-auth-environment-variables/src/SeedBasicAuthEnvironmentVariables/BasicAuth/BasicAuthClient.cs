using System.Text.Json;
using SeedBasicAuthEnvironmentVariables.Core;

namespace SeedBasicAuthEnvironmentVariables;

public partial class BasicAuthClient : IBasicAuthClient
{
    private RawClient _client;

    internal BasicAuthClient(RawClient client)
    {
        _client = client;
        Raw = new RawAccessClient(_client);
    }

    public BasicAuthClient.RawAccessClient Raw { get; }

    /// <summary>
    /// GET request with basic auth scheme
    /// </summary>
    /// <example><code>
    /// await client.BasicAuth.GetWithBasicAuthAsync();
    /// </code></example>
    public async Task<bool> GetWithBasicAuthAsync(
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
                    Path = "basic-auth",
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
                return JsonUtils.Deserialize<bool>(responseBody)!;
            }
            catch (JsonException e)
            {
                throw new SeedBasicAuthEnvironmentVariablesException(
                    "Failed to deserialize response",
                    e
                );
            }
        }

        {
            var responseBody = await response.Raw.Content.ReadAsStringAsync();
            try
            {
                switch (response.StatusCode)
                {
                    case 401:
                        throw new UnauthorizedRequest(
                            JsonUtils.Deserialize<UnauthorizedRequestErrorBody>(responseBody)
                        );
                }
            }
            catch (JsonException)
            {
                // unable to map error response, throwing generic error
            }
            throw new SeedBasicAuthEnvironmentVariablesApiException(
                $"Error with status code {response.StatusCode}",
                response.StatusCode,
                responseBody
            );
        }
    }

    /// <summary>
    /// POST request with basic auth scheme
    /// </summary>
    /// <example><code>
    /// await client.BasicAuth.PostWithBasicAuthAsync(
    ///     new Dictionary&lt;object, object?&gt;() { { "key", "value" } }
    /// );
    /// </code></example>
    public async Task<bool> PostWithBasicAuthAsync(
        object request,
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
                    Path = "basic-auth",
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
                return JsonUtils.Deserialize<bool>(responseBody)!;
            }
            catch (JsonException e)
            {
                throw new SeedBasicAuthEnvironmentVariablesException(
                    "Failed to deserialize response",
                    e
                );
            }
        }

        {
            var responseBody = await response.Raw.Content.ReadAsStringAsync();
            try
            {
                switch (response.StatusCode)
                {
                    case 401:
                        throw new UnauthorizedRequest(
                            JsonUtils.Deserialize<UnauthorizedRequestErrorBody>(responseBody)
                        );
                    case 400:
                        throw new BadRequest(JsonUtils.Deserialize<object>(responseBody));
                }
            }
            catch (JsonException)
            {
                // unable to map error response, throwing generic error
            }
            throw new SeedBasicAuthEnvironmentVariablesApiException(
                $"Error with status code {response.StatusCode}",
                response.StatusCode,
                responseBody
            );
        }
    }

    public partial class RawAccessClient
    {
        private readonly RawClient _client;

        internal RawAccessClient(RawClient client)
        {
            _client = client;
        }

        private static IReadOnlyDictionary<string, IEnumerable<string>> ExtractHeaders(
            HttpResponseMessage response
        )
        {
            var headers = new Dictionary<string, IEnumerable<string>>(
                StringComparer.OrdinalIgnoreCase
            );
            foreach (var header in response.Headers)
            {
                headers[header.Key] = header.Value.ToList();
            }
            if (response.Content != null)
            {
                foreach (var header in response.Content.Headers)
                {
                    headers[header.Key] = header.Value.ToList();
                }
            }
            return headers;
        }

        /// <summary>
        /// GET request with basic auth scheme
        /// </summary>
        public async Task<RawResponse<bool>> GetWithBasicAuthAsync(
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
                        Path = "basic-auth",
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
                    var body = JsonUtils.Deserialize<bool>(responseBody)!;
                    return new RawResponse<bool>
                    {
                        StatusCode = (System.Net.HttpStatusCode)response.StatusCode,
                        Url = response.Raw.RequestMessage?.RequestUri!,
                        Headers = ExtractHeaders(response.Raw),
                        Body = body,
                    };
                }
                catch (JsonException e)
                {
                    throw new SeedBasicAuthEnvironmentVariablesException(
                        "Failed to deserialize response",
                        e
                    );
                }
            }

            {
                var responseBody = await response.Raw.Content.ReadAsStringAsync();
                try
                {
                    switch (response.StatusCode)
                    {
                        case 401:
                            throw new UnauthorizedRequest(
                                JsonUtils.Deserialize<UnauthorizedRequestErrorBody>(responseBody)
                            );
                    }
                }
                catch (JsonException)
                {
                    // unable to map error response, throwing generic error
                }
                throw new SeedBasicAuthEnvironmentVariablesApiException(
                    $"Error with status code {response.StatusCode}",
                    response.StatusCode,
                    responseBody
                );
            }
        }

        /// <summary>
        /// POST request with basic auth scheme
        /// </summary>
        public async Task<RawResponse<bool>> PostWithBasicAuthAsync(
            object request,
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
                        Path = "basic-auth",
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
                    var body = JsonUtils.Deserialize<bool>(responseBody)!;
                    return new RawResponse<bool>
                    {
                        StatusCode = (System.Net.HttpStatusCode)response.StatusCode,
                        Url = response.Raw.RequestMessage?.RequestUri!,
                        Headers = ExtractHeaders(response.Raw),
                        Body = body,
                    };
                }
                catch (JsonException e)
                {
                    throw new SeedBasicAuthEnvironmentVariablesException(
                        "Failed to deserialize response",
                        e
                    );
                }
            }

            {
                var responseBody = await response.Raw.Content.ReadAsStringAsync();
                try
                {
                    switch (response.StatusCode)
                    {
                        case 401:
                            throw new UnauthorizedRequest(
                                JsonUtils.Deserialize<UnauthorizedRequestErrorBody>(responseBody)
                            );
                        case 400:
                            throw new BadRequest(JsonUtils.Deserialize<object>(responseBody));
                    }
                }
                catch (JsonException)
                {
                    // unable to map error response, throwing generic error
                }
                throw new SeedBasicAuthEnvironmentVariablesApiException(
                    $"Error with status code {response.StatusCode}",
                    response.StatusCode,
                    responseBody
                );
            }
        }
    }
}
