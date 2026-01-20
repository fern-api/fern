using System.Text.Json;
using SeedApi;
using SeedApi.Core;

namespace SeedApi.Folder;

public partial class ServiceClient : IServiceClient
{
    private RawClient _client;

    internal ServiceClient(RawClient client)
    {
        _client = client;
        Raw = new WithRawResponseClient(_client);
    }

    public ServiceClient.WithRawResponseClient Raw { get; }

    /// <example><code>
    /// await client.Folder.Service.EndpointAsync();
    /// </code></example>
    public async Task EndpointAsync(
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        await Raw.EndpointAsync(options, cancellationToken);
    }

    /// <example><code>
    /// await client.Folder.Service.UnknownRequestAsync(
    ///     new Dictionary&lt;object, object?&gt;() { { "key", "value" } }
    /// );
    /// </code></example>
    public async Task UnknownRequestAsync(
        object request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        await Raw.UnknownRequestAsync(request, options, cancellationToken);
    }

    public partial class WithRawResponseClient
    {
        private readonly RawClient _client;

        internal WithRawResponseClient(RawClient client)
        {
            _client = client;
        }

        public async Task<WithRawResponse<object>> EndpointAsync(
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
                        Path = "/service",
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
                throw new SeedApiApiException(
                    $"Error with status code {response.StatusCode}",
                    response.StatusCode,
                    responseBody
                );
            }
        }

        public async Task<WithRawResponse<object>> UnknownRequestAsync(
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
                        Path = "/service",
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
                try
                {
                    switch (response.StatusCode)
                    {
                        case 404:
                            throw new NotFoundError(JsonUtils.Deserialize<string>(responseBody));
                    }
                }
                catch (JsonException)
                {
                    // unable to map error response, throwing generic error
                }
                throw new SeedApiApiException(
                    $"Error with status code {response.StatusCode}",
                    response.StatusCode,
                    responseBody
                );
            }
        }
    }
}
