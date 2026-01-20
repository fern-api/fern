using System.Text.Json;
using SeedBasicAuth.Core;

namespace SeedBasicAuth;

public partial class BasicAuthClient : IBasicAuthClient
{
    private RawClient _client;

    internal BasicAuthClient(RawClient client)
    {
        _client = client;
        Raw = new WithRawResponseClient(_client);
    }

    public BasicAuthClient.WithRawResponseClient Raw { get; }

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
        var response = await Raw.GetWithBasicAuthAsync(options, cancellationToken);
        return response.Data;
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
        var response = await Raw.PostWithBasicAuthAsync(request, options, cancellationToken);
        return response.Data;
    }

    public partial class WithRawResponseClient
    {
        private readonly RawClient _client;

        internal WithRawResponseClient(RawClient client)
        {
            _client = client;
        }

        /// <summary>
        /// GET request with basic auth scheme
        /// </summary>
        public async Task<WithRawResponse<bool>> GetWithBasicAuthAsync(
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
                    var data = JsonUtils.Deserialize<bool>(responseBody)!;
                    return new WithRawResponse<bool>
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
                    throw new SeedBasicAuthException("Failed to deserialize response", e);
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
                throw new SeedBasicAuthApiException(
                    $"Error with status code {response.StatusCode}",
                    response.StatusCode,
                    responseBody
                );
            }
        }

        /// <summary>
        /// POST request with basic auth scheme
        /// </summary>
        public async Task<WithRawResponse<bool>> PostWithBasicAuthAsync(
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
                    var data = JsonUtils.Deserialize<bool>(responseBody)!;
                    return new WithRawResponse<bool>
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
                    throw new SeedBasicAuthException("Failed to deserialize response", e);
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
                throw new SeedBasicAuthApiException(
                    $"Error with status code {response.StatusCode}",
                    response.StatusCode,
                    responseBody
                );
            }
        }
    }
}
