using System.Text.Json;
using SeedExhaustive;
using SeedExhaustive.Core;

namespace SeedExhaustive.Endpoints;

public partial class UrlsClient : IUrlsClient
{
    private RawClient _client;

    internal UrlsClient(RawClient client)
    {
        try
        {
            _client = client;
            Raw = new RawAccessClient(_client);
        }
        catch (Exception ex)
        {
            client.Options.ExceptionHandler?.CaptureException(ex);
            throw;
        }
    }

    public UrlsClient.RawAccessClient Raw { get; }

    /// <example><code>
    /// await client.Endpoints.Urls.WithMixedCaseAsync();
    /// </code></example>
    public async Task<string> WithMixedCaseAsync(
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        return await _client
            .Options.ExceptionHandler.TryCatchAsync(async () =>
            {
                var response = await Raw.WithMixedCaseAsync(options, cancellationToken);
                return response.Data;
            })
            .ConfigureAwait(false);
    }

    /// <example><code>
    /// await client.Endpoints.Urls.NoEndingSlashAsync();
    /// </code></example>
    public async Task<string> NoEndingSlashAsync(
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        return await _client
            .Options.ExceptionHandler.TryCatchAsync(async () =>
            {
                var response = await Raw.NoEndingSlashAsync(options, cancellationToken);
                return response.Data;
            })
            .ConfigureAwait(false);
    }

    /// <example><code>
    /// await client.Endpoints.Urls.WithEndingSlashAsync();
    /// </code></example>
    public async Task<string> WithEndingSlashAsync(
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        return await _client
            .Options.ExceptionHandler.TryCatchAsync(async () =>
            {
                var response = await Raw.WithEndingSlashAsync(options, cancellationToken);
                return response.Data;
            })
            .ConfigureAwait(false);
    }

    /// <example><code>
    /// await client.Endpoints.Urls.WithUnderscoresAsync();
    /// </code></example>
    public async Task<string> WithUnderscoresAsync(
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        return await _client
            .Options.ExceptionHandler.TryCatchAsync(async () =>
            {
                var response = await Raw.WithUnderscoresAsync(options, cancellationToken);
                return response.Data;
            })
            .ConfigureAwait(false);
    }

    public partial class RawAccessClient
    {
        private readonly RawClient _client;

        internal RawAccessClient(RawClient client)
        {
            _client = client;
        }

        public async Task<WithRawResponse<string>> WithMixedCaseAsync(
            RequestOptions? options = null,
            CancellationToken cancellationToken = default
        )
        {
            return await _client
                .Options.ExceptionHandler.TryCatchAsync(async () =>
                {
                    var response = await _client
                        .SendRequestAsync(
                            new JsonRequest
                            {
                                BaseUrl = _client.Options.BaseUrl,
                                Method = HttpMethod.Get,
                                Path = "/urls/MixedCase",
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
                                    StatusCode = (global::System.Net.HttpStatusCode)
                                        response.StatusCode,
                                    Url = response.Raw.RequestMessage?.RequestUri!,
                                    Headers = ResponseHeaders.FromHttpResponseMessage(response.Raw),
                                },
                            };
                        }
                        catch (JsonException e)
                        {
                            throw new SeedExhaustiveException("Failed to deserialize response", e);
                        }
                    }

                    {
                        var responseBody = await response.Raw.Content.ReadAsStringAsync();
                        throw new SeedExhaustiveApiException(
                            $"Error with status code {response.StatusCode}",
                            response.StatusCode,
                            responseBody
                        );
                    }
                })
                .ConfigureAwait(false);
        }

        public async Task<WithRawResponse<string>> NoEndingSlashAsync(
            RequestOptions? options = null,
            CancellationToken cancellationToken = default
        )
        {
            return await _client
                .Options.ExceptionHandler.TryCatchAsync(async () =>
                {
                    var response = await _client
                        .SendRequestAsync(
                            new JsonRequest
                            {
                                BaseUrl = _client.Options.BaseUrl,
                                Method = HttpMethod.Get,
                                Path = "/urls/no-ending-slash",
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
                                    StatusCode = (global::System.Net.HttpStatusCode)
                                        response.StatusCode,
                                    Url = response.Raw.RequestMessage?.RequestUri!,
                                    Headers = ResponseHeaders.FromHttpResponseMessage(response.Raw),
                                },
                            };
                        }
                        catch (JsonException e)
                        {
                            throw new SeedExhaustiveException("Failed to deserialize response", e);
                        }
                    }

                    {
                        var responseBody = await response.Raw.Content.ReadAsStringAsync();
                        throw new SeedExhaustiveApiException(
                            $"Error with status code {response.StatusCode}",
                            response.StatusCode,
                            responseBody
                        );
                    }
                })
                .ConfigureAwait(false);
        }

        public async Task<WithRawResponse<string>> WithEndingSlashAsync(
            RequestOptions? options = null,
            CancellationToken cancellationToken = default
        )
        {
            return await _client
                .Options.ExceptionHandler.TryCatchAsync(async () =>
                {
                    var response = await _client
                        .SendRequestAsync(
                            new JsonRequest
                            {
                                BaseUrl = _client.Options.BaseUrl,
                                Method = HttpMethod.Get,
                                Path = "/urls/with-ending-slash/",
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
                                    StatusCode = (global::System.Net.HttpStatusCode)
                                        response.StatusCode,
                                    Url = response.Raw.RequestMessage?.RequestUri!,
                                    Headers = ResponseHeaders.FromHttpResponseMessage(response.Raw),
                                },
                            };
                        }
                        catch (JsonException e)
                        {
                            throw new SeedExhaustiveException("Failed to deserialize response", e);
                        }
                    }

                    {
                        var responseBody = await response.Raw.Content.ReadAsStringAsync();
                        throw new SeedExhaustiveApiException(
                            $"Error with status code {response.StatusCode}",
                            response.StatusCode,
                            responseBody
                        );
                    }
                })
                .ConfigureAwait(false);
        }

        public async Task<WithRawResponse<string>> WithUnderscoresAsync(
            RequestOptions? options = null,
            CancellationToken cancellationToken = default
        )
        {
            return await _client
                .Options.ExceptionHandler.TryCatchAsync(async () =>
                {
                    var response = await _client
                        .SendRequestAsync(
                            new JsonRequest
                            {
                                BaseUrl = _client.Options.BaseUrl,
                                Method = HttpMethod.Get,
                                Path = "/urls/with_underscores",
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
                                    StatusCode = (global::System.Net.HttpStatusCode)
                                        response.StatusCode,
                                    Url = response.Raw.RequestMessage?.RequestUri!,
                                    Headers = ResponseHeaders.FromHttpResponseMessage(response.Raw),
                                },
                            };
                        }
                        catch (JsonException e)
                        {
                            throw new SeedExhaustiveException("Failed to deserialize response", e);
                        }
                    }

                    {
                        var responseBody = await response.Raw.Content.ReadAsStringAsync();
                        throw new SeedExhaustiveApiException(
                            $"Error with status code {response.StatusCode}",
                            response.StatusCode,
                            responseBody
                        );
                    }
                })
                .ConfigureAwait(false);
        }
    }
}
