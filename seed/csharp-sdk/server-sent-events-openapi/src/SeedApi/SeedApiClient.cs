using global::System.Net.ServerSentEvents;
using global::System.Runtime.CompilerServices;
using global::System.Text.Json;
using SeedApi.Core;

namespace SeedApi;

public partial class SeedApiClient : ISeedApiClient
{
    private readonly RawClient _client;

    public SeedApiClient(ClientOptions? clientOptions = null)
    {
        clientOptions ??= new ClientOptions();
        var platformHeaders = new Headers(
            new Dictionary<string, string>()
            {
                { "X-Fern-Language", "C#" },
                { "X-Fern-SDK-Name", "SeedApi" },
                { "X-Fern-SDK-Version", Version.Current },
                { "User-Agent", "Fernserver-sent-events-openapi/0.0.1" },
            }
        );
        foreach (var header in platformHeaders)
        {
            if (!clientOptions.Headers.ContainsKey(header.Key))
            {
                clientOptions.Headers[header.Key] = header.Value;
            }
        }
        _client = new RawClient(clientOptions);
    }

    private async Task<
        WithRawResponse<IAsyncEnumerable<StreamProtocolNoCollisionResponse>>
    > StreamProtocolNoCollisionAsyncCore(
        StreamRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        var _headers = await new SeedApi.Core.HeadersBuilder.Builder()
            .Add(_client.Options.Headers)
            .Add(_client.Options.AdditionalHeaders)
            .Add(options?.AdditionalHeaders)
            .BuildAsync()
            .ConfigureAwait(false);
        var response = await _client
            .SendRequestAsync(
                new JsonRequest
                {
                    Method = HttpMethod.Post,
                    Path = "stream/protocol-no-collision",
                    Body = request,
                    Headers = _headers,
                    Options = options,
                },
                cancellationToken
            )
            .ConfigureAwait(false);
        if (response.StatusCode is >= 200 and < 400)
        {
            return new WithRawResponse<IAsyncEnumerable<StreamProtocolNoCollisionResponse>>()
            {
                Data = StreamProtocolNoCollisionAsyncBody(response, cancellationToken),
                RawResponse = new SeedApi.RawResponse()
                {
                    StatusCode = response.Raw.StatusCode,
                    Url = response.Raw.RequestMessage?.RequestUri ?? new Uri("about:blank"),
                    Headers = ResponseHeaders.FromHttpResponseMessage(response.Raw),
                },
            };
        }
        {
            var responseBody = await response
                .Raw.Content.ReadAsStringAsync(cancellationToken)
                .ConfigureAwait(false);
            throw new SeedApiApiException(
                $"Error with status code {response.StatusCode}",
                response.StatusCode,
                responseBody,
                rawResponse: new SeedApi.RawResponse()
                {
                    StatusCode = response.Raw.StatusCode,
                    Url = response.Raw.RequestMessage?.RequestUri ?? new Uri("about:blank"),
                    Headers = ResponseHeaders.FromHttpResponseMessage(response.Raw),
                }
            );
        }
    }

    private async IAsyncEnumerable<StreamProtocolNoCollisionResponse> StreamProtocolNoCollisionAsyncBody(
        ApiResponse response,
        [EnumeratorCancellation] CancellationToken cancellationToken = default
    )
    {
        await foreach (
            var item in SseParser
                .Create(await response.Raw.Content.ReadAsStreamAsync())
                .EnumerateAsync(cancellationToken)
        )
        {
            if (!string.IsNullOrEmpty(item.Data))
            {
                StreamProtocolNoCollisionResponse? result;
                try
                {
                    result = JsonUtils.Deserialize<StreamProtocolNoCollisionResponse>(item.Data);
                }
                catch (JsonException)
                {
                    throw new SeedApiException($"Unable to deserialize JSON response 'item.Data'");
                }
                yield return result!;
            }
        }
    }

    private async Task<
        WithRawResponse<IAsyncEnumerable<StreamProtocolCollisionResponse>>
    > StreamProtocolCollisionAsyncCore(
        StreamRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        var _headers = await new SeedApi.Core.HeadersBuilder.Builder()
            .Add(_client.Options.Headers)
            .Add(_client.Options.AdditionalHeaders)
            .Add(options?.AdditionalHeaders)
            .BuildAsync()
            .ConfigureAwait(false);
        var response = await _client
            .SendRequestAsync(
                new JsonRequest
                {
                    Method = HttpMethod.Post,
                    Path = "stream/protocol-collision",
                    Body = request,
                    Headers = _headers,
                    Options = options,
                },
                cancellationToken
            )
            .ConfigureAwait(false);
        if (response.StatusCode is >= 200 and < 400)
        {
            return new WithRawResponse<IAsyncEnumerable<StreamProtocolCollisionResponse>>()
            {
                Data = StreamProtocolCollisionAsyncBody(response, cancellationToken),
                RawResponse = new SeedApi.RawResponse()
                {
                    StatusCode = response.Raw.StatusCode,
                    Url = response.Raw.RequestMessage?.RequestUri ?? new Uri("about:blank"),
                    Headers = ResponseHeaders.FromHttpResponseMessage(response.Raw),
                },
            };
        }
        {
            var responseBody = await response
                .Raw.Content.ReadAsStringAsync(cancellationToken)
                .ConfigureAwait(false);
            throw new SeedApiApiException(
                $"Error with status code {response.StatusCode}",
                response.StatusCode,
                responseBody,
                rawResponse: new SeedApi.RawResponse()
                {
                    StatusCode = response.Raw.StatusCode,
                    Url = response.Raw.RequestMessage?.RequestUri ?? new Uri("about:blank"),
                    Headers = ResponseHeaders.FromHttpResponseMessage(response.Raw),
                }
            );
        }
    }

    private async IAsyncEnumerable<StreamProtocolCollisionResponse> StreamProtocolCollisionAsyncBody(
        ApiResponse response,
        [EnumeratorCancellation] CancellationToken cancellationToken = default
    )
    {
        await foreach (
            var item in SseParser
                .Create(await response.Raw.Content.ReadAsStreamAsync())
                .EnumerateAsync(cancellationToken)
        )
        {
            if (!string.IsNullOrEmpty(item.Data))
            {
                StreamProtocolCollisionResponse? result;
                try
                {
                    result = JsonUtils.Deserialize<StreamProtocolCollisionResponse>(item.Data);
                }
                catch (JsonException)
                {
                    throw new SeedApiException($"Unable to deserialize JSON response 'item.Data'");
                }
                yield return result!;
            }
        }
    }

    private async Task<
        WithRawResponse<IAsyncEnumerable<StreamDataContextResponse>>
    > StreamDataContextAsyncCore(
        StreamRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        var _headers = await new SeedApi.Core.HeadersBuilder.Builder()
            .Add(_client.Options.Headers)
            .Add(_client.Options.AdditionalHeaders)
            .Add(options?.AdditionalHeaders)
            .BuildAsync()
            .ConfigureAwait(false);
        var response = await _client
            .SendRequestAsync(
                new JsonRequest
                {
                    Method = HttpMethod.Post,
                    Path = "stream/data-context",
                    Body = request,
                    Headers = _headers,
                    Options = options,
                },
                cancellationToken
            )
            .ConfigureAwait(false);
        if (response.StatusCode is >= 200 and < 400)
        {
            return new WithRawResponse<IAsyncEnumerable<StreamDataContextResponse>>()
            {
                Data = StreamDataContextAsyncBody(response, cancellationToken),
                RawResponse = new SeedApi.RawResponse()
                {
                    StatusCode = response.Raw.StatusCode,
                    Url = response.Raw.RequestMessage?.RequestUri ?? new Uri("about:blank"),
                    Headers = ResponseHeaders.FromHttpResponseMessage(response.Raw),
                },
            };
        }
        {
            var responseBody = await response
                .Raw.Content.ReadAsStringAsync(cancellationToken)
                .ConfigureAwait(false);
            throw new SeedApiApiException(
                $"Error with status code {response.StatusCode}",
                response.StatusCode,
                responseBody,
                rawResponse: new SeedApi.RawResponse()
                {
                    StatusCode = response.Raw.StatusCode,
                    Url = response.Raw.RequestMessage?.RequestUri ?? new Uri("about:blank"),
                    Headers = ResponseHeaders.FromHttpResponseMessage(response.Raw),
                }
            );
        }
    }

    private async IAsyncEnumerable<StreamDataContextResponse> StreamDataContextAsyncBody(
        ApiResponse response,
        [EnumeratorCancellation] CancellationToken cancellationToken = default
    )
    {
        await foreach (
            var item in SseParser
                .Create(await response.Raw.Content.ReadAsStreamAsync())
                .EnumerateAsync(cancellationToken)
        )
        {
            if (!string.IsNullOrEmpty(item.Data))
            {
                StreamDataContextResponse? result;
                try
                {
                    result = JsonUtils.Deserialize<StreamDataContextResponse>(item.Data);
                }
                catch (JsonException)
                {
                    throw new SeedApiException($"Unable to deserialize JSON response 'item.Data'");
                }
                yield return result!;
            }
        }
    }

    private async Task<
        WithRawResponse<IAsyncEnumerable<StreamNoContextResponse>>
    > StreamNoContextAsyncCore(
        StreamRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        var _headers = await new SeedApi.Core.HeadersBuilder.Builder()
            .Add(_client.Options.Headers)
            .Add(_client.Options.AdditionalHeaders)
            .Add(options?.AdditionalHeaders)
            .BuildAsync()
            .ConfigureAwait(false);
        var response = await _client
            .SendRequestAsync(
                new JsonRequest
                {
                    Method = HttpMethod.Post,
                    Path = "stream/no-context",
                    Body = request,
                    Headers = _headers,
                    Options = options,
                },
                cancellationToken
            )
            .ConfigureAwait(false);
        if (response.StatusCode is >= 200 and < 400)
        {
            return new WithRawResponse<IAsyncEnumerable<StreamNoContextResponse>>()
            {
                Data = StreamNoContextAsyncBody(response, cancellationToken),
                RawResponse = new SeedApi.RawResponse()
                {
                    StatusCode = response.Raw.StatusCode,
                    Url = response.Raw.RequestMessage?.RequestUri ?? new Uri("about:blank"),
                    Headers = ResponseHeaders.FromHttpResponseMessage(response.Raw),
                },
            };
        }
        {
            var responseBody = await response
                .Raw.Content.ReadAsStringAsync(cancellationToken)
                .ConfigureAwait(false);
            throw new SeedApiApiException(
                $"Error with status code {response.StatusCode}",
                response.StatusCode,
                responseBody,
                rawResponse: new SeedApi.RawResponse()
                {
                    StatusCode = response.Raw.StatusCode,
                    Url = response.Raw.RequestMessage?.RequestUri ?? new Uri("about:blank"),
                    Headers = ResponseHeaders.FromHttpResponseMessage(response.Raw),
                }
            );
        }
    }

    private async IAsyncEnumerable<StreamNoContextResponse> StreamNoContextAsyncBody(
        ApiResponse response,
        [EnumeratorCancellation] CancellationToken cancellationToken = default
    )
    {
        await foreach (
            var item in SseParser
                .Create(await response.Raw.Content.ReadAsStreamAsync())
                .EnumerateAsync(cancellationToken)
        )
        {
            if (!string.IsNullOrEmpty(item.Data))
            {
                StreamNoContextResponse? result;
                try
                {
                    result = JsonUtils.Deserialize<StreamNoContextResponse>(item.Data);
                }
                catch (JsonException)
                {
                    throw new SeedApiException($"Unable to deserialize JSON response 'item.Data'");
                }
                yield return result!;
            }
        }
    }

    private async Task<
        WithRawResponse<IAsyncEnumerable<StreamProtocolWithFlatSchemaResponse>>
    > StreamProtocolWithFlatSchemaAsyncCore(
        StreamRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        var _headers = await new SeedApi.Core.HeadersBuilder.Builder()
            .Add(_client.Options.Headers)
            .Add(_client.Options.AdditionalHeaders)
            .Add(options?.AdditionalHeaders)
            .BuildAsync()
            .ConfigureAwait(false);
        var response = await _client
            .SendRequestAsync(
                new JsonRequest
                {
                    Method = HttpMethod.Post,
                    Path = "stream/protocol-with-flat-schema",
                    Body = request,
                    Headers = _headers,
                    Options = options,
                },
                cancellationToken
            )
            .ConfigureAwait(false);
        if (response.StatusCode is >= 200 and < 400)
        {
            return new WithRawResponse<IAsyncEnumerable<StreamProtocolWithFlatSchemaResponse>>()
            {
                Data = StreamProtocolWithFlatSchemaAsyncBody(response, cancellationToken),
                RawResponse = new SeedApi.RawResponse()
                {
                    StatusCode = response.Raw.StatusCode,
                    Url = response.Raw.RequestMessage?.RequestUri ?? new Uri("about:blank"),
                    Headers = ResponseHeaders.FromHttpResponseMessage(response.Raw),
                },
            };
        }
        {
            var responseBody = await response
                .Raw.Content.ReadAsStringAsync(cancellationToken)
                .ConfigureAwait(false);
            throw new SeedApiApiException(
                $"Error with status code {response.StatusCode}",
                response.StatusCode,
                responseBody,
                rawResponse: new SeedApi.RawResponse()
                {
                    StatusCode = response.Raw.StatusCode,
                    Url = response.Raw.RequestMessage?.RequestUri ?? new Uri("about:blank"),
                    Headers = ResponseHeaders.FromHttpResponseMessage(response.Raw),
                }
            );
        }
    }

    private async IAsyncEnumerable<StreamProtocolWithFlatSchemaResponse> StreamProtocolWithFlatSchemaAsyncBody(
        ApiResponse response,
        [EnumeratorCancellation] CancellationToken cancellationToken = default
    )
    {
        await foreach (
            var item in SseParser
                .Create(await response.Raw.Content.ReadAsStreamAsync())
                .EnumerateAsync(cancellationToken)
        )
        {
            if (!string.IsNullOrEmpty(item.Data))
            {
                StreamProtocolWithFlatSchemaResponse? result;
                try
                {
                    result = JsonUtils.Deserialize<StreamProtocolWithFlatSchemaResponse>(item.Data);
                }
                catch (JsonException)
                {
                    throw new SeedApiException($"Unable to deserialize JSON response 'item.Data'");
                }
                yield return result!;
            }
        }
    }

    private async Task<
        WithRawResponse<IAsyncEnumerable<StreamDataContextWithEnvelopeSchemaResponse>>
    > StreamDataContextWithEnvelopeSchemaAsyncCore(
        StreamRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        var _headers = await new SeedApi.Core.HeadersBuilder.Builder()
            .Add(_client.Options.Headers)
            .Add(_client.Options.AdditionalHeaders)
            .Add(options?.AdditionalHeaders)
            .BuildAsync()
            .ConfigureAwait(false);
        var response = await _client
            .SendRequestAsync(
                new JsonRequest
                {
                    Method = HttpMethod.Post,
                    Path = "stream/data-context-with-envelope-schema",
                    Body = request,
                    Headers = _headers,
                    Options = options,
                },
                cancellationToken
            )
            .ConfigureAwait(false);
        if (response.StatusCode is >= 200 and < 400)
        {
            return new WithRawResponse<
                IAsyncEnumerable<StreamDataContextWithEnvelopeSchemaResponse>
            >()
            {
                Data = StreamDataContextWithEnvelopeSchemaAsyncBody(response, cancellationToken),
                RawResponse = new SeedApi.RawResponse()
                {
                    StatusCode = response.Raw.StatusCode,
                    Url = response.Raw.RequestMessage?.RequestUri ?? new Uri("about:blank"),
                    Headers = ResponseHeaders.FromHttpResponseMessage(response.Raw),
                },
            };
        }
        {
            var responseBody = await response
                .Raw.Content.ReadAsStringAsync(cancellationToken)
                .ConfigureAwait(false);
            throw new SeedApiApiException(
                $"Error with status code {response.StatusCode}",
                response.StatusCode,
                responseBody,
                rawResponse: new SeedApi.RawResponse()
                {
                    StatusCode = response.Raw.StatusCode,
                    Url = response.Raw.RequestMessage?.RequestUri ?? new Uri("about:blank"),
                    Headers = ResponseHeaders.FromHttpResponseMessage(response.Raw),
                }
            );
        }
    }

    private async IAsyncEnumerable<StreamDataContextWithEnvelopeSchemaResponse> StreamDataContextWithEnvelopeSchemaAsyncBody(
        ApiResponse response,
        [EnumeratorCancellation] CancellationToken cancellationToken = default
    )
    {
        await foreach (
            var item in SseParser
                .Create(await response.Raw.Content.ReadAsStreamAsync())
                .EnumerateAsync(cancellationToken)
        )
        {
            if (!string.IsNullOrEmpty(item.Data))
            {
                StreamDataContextWithEnvelopeSchemaResponse? result;
                try
                {
                    result = JsonUtils.Deserialize<StreamDataContextWithEnvelopeSchemaResponse>(
                        item.Data
                    );
                }
                catch (JsonException)
                {
                    throw new SeedApiException($"Unable to deserialize JSON response 'item.Data'");
                }
                yield return result!;
            }
        }
    }

    private async Task<WithRawResponse<IAsyncEnumerable<Event>>> StreamOasSpecNativeAsyncCore(
        StreamRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        var _headers = await new SeedApi.Core.HeadersBuilder.Builder()
            .Add(_client.Options.Headers)
            .Add(_client.Options.AdditionalHeaders)
            .Add(options?.AdditionalHeaders)
            .BuildAsync()
            .ConfigureAwait(false);
        var response = await _client
            .SendRequestAsync(
                new JsonRequest
                {
                    Method = HttpMethod.Post,
                    Path = "stream/oas-spec-native",
                    Body = request,
                    Headers = _headers,
                    Options = options,
                },
                cancellationToken
            )
            .ConfigureAwait(false);
        if (response.StatusCode is >= 200 and < 400)
        {
            return new WithRawResponse<IAsyncEnumerable<Event>>()
            {
                Data = StreamOasSpecNativeAsyncBody(response, cancellationToken),
                RawResponse = new SeedApi.RawResponse()
                {
                    StatusCode = response.Raw.StatusCode,
                    Url = response.Raw.RequestMessage?.RequestUri ?? new Uri("about:blank"),
                    Headers = ResponseHeaders.FromHttpResponseMessage(response.Raw),
                },
            };
        }
        {
            var responseBody = await response
                .Raw.Content.ReadAsStringAsync(cancellationToken)
                .ConfigureAwait(false);
            throw new SeedApiApiException(
                $"Error with status code {response.StatusCode}",
                response.StatusCode,
                responseBody,
                rawResponse: new SeedApi.RawResponse()
                {
                    StatusCode = response.Raw.StatusCode,
                    Url = response.Raw.RequestMessage?.RequestUri ?? new Uri("about:blank"),
                    Headers = ResponseHeaders.FromHttpResponseMessage(response.Raw),
                }
            );
        }
    }

    private async IAsyncEnumerable<Event> StreamOasSpecNativeAsyncBody(
        ApiResponse response,
        [EnumeratorCancellation] CancellationToken cancellationToken = default
    )
    {
        await foreach (
            var item in SseParser
                .Create(await response.Raw.Content.ReadAsStreamAsync())
                .EnumerateAsync(cancellationToken)
        )
        {
            if (!string.IsNullOrEmpty(item.Data))
            {
                Event? result;
                try
                {
                    result = JsonUtils.Deserialize<Event>(item.Data);
                }
                catch (JsonException)
                {
                    throw new SeedApiException($"Unable to deserialize JSON response 'item.Data'");
                }
                yield return result!;
            }
        }
    }

    private async Task<
        WithRawResponse<IAsyncEnumerable<CompletionStreamChunk>>
    > StreamXFernStreamingConditionStreamAsyncCore(
        StreamXFernStreamingConditionStreamRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        var _headers = await new SeedApi.Core.HeadersBuilder.Builder()
            .Add(_client.Options.Headers)
            .Add(_client.Options.AdditionalHeaders)
            .Add(options?.AdditionalHeaders)
            .BuildAsync()
            .ConfigureAwait(false);
        var response = await _client
            .SendRequestAsync(
                new JsonRequest
                {
                    Method = HttpMethod.Post,
                    Path = "stream/x-fern-streaming-condition",
                    Body = request,
                    Headers = _headers,
                    ContentType = "application/json",
                    Options = options,
                },
                cancellationToken
            )
            .ConfigureAwait(false);
        if (response.StatusCode is >= 200 and < 400)
        {
            return new WithRawResponse<IAsyncEnumerable<CompletionStreamChunk>>()
            {
                Data = StreamXFernStreamingConditionStreamAsyncBody(response, cancellationToken),
                RawResponse = new SeedApi.RawResponse()
                {
                    StatusCode = response.Raw.StatusCode,
                    Url = response.Raw.RequestMessage?.RequestUri ?? new Uri("about:blank"),
                    Headers = ResponseHeaders.FromHttpResponseMessage(response.Raw),
                },
            };
        }
        {
            var responseBody = await response
                .Raw.Content.ReadAsStringAsync(cancellationToken)
                .ConfigureAwait(false);
            throw new SeedApiApiException(
                $"Error with status code {response.StatusCode}",
                response.StatusCode,
                responseBody,
                rawResponse: new SeedApi.RawResponse()
                {
                    StatusCode = response.Raw.StatusCode,
                    Url = response.Raw.RequestMessage?.RequestUri ?? new Uri("about:blank"),
                    Headers = ResponseHeaders.FromHttpResponseMessage(response.Raw),
                }
            );
        }
    }

    private async IAsyncEnumerable<CompletionStreamChunk> StreamXFernStreamingConditionStreamAsyncBody(
        ApiResponse response,
        [EnumeratorCancellation] CancellationToken cancellationToken = default
    )
    {
        string? line;
        using var reader = new StreamReader(await response.Raw.Content.ReadAsStreamAsync());
        while (!string.IsNullOrEmpty(line = await reader.ReadLineAsync()))
        {
            CompletionStreamChunk? result;
            try
            {
                result = JsonUtils.Deserialize<CompletionStreamChunk>(line);
            }
            catch (JsonException)
            {
                throw new SeedApiException($"Unable to deserialize JSON response 'line'");
            }
            yield return result!;
        }
    }

    private async Task<
        WithRawResponse<CompletionFullResponse>
    > StreamXFernStreamingConditionAsyncCore(
        StreamXFernStreamingConditionRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        var _headers = await new SeedApi.Core.HeadersBuilder.Builder()
            .Add(_client.Options.Headers)
            .Add(_client.Options.AdditionalHeaders)
            .Add(options?.AdditionalHeaders)
            .BuildAsync()
            .ConfigureAwait(false);
        var response = await _client
            .SendRequestAsync(
                new JsonRequest
                {
                    Method = HttpMethod.Post,
                    Path = "stream/x-fern-streaming-condition",
                    Body = request,
                    Headers = _headers,
                    ContentType = "application/json",
                    Options = options,
                },
                cancellationToken
            )
            .ConfigureAwait(false);
        if (response.StatusCode is >= 200 and < 400)
        {
            var responseBody = await response
                .Raw.Content.ReadAsStringAsync(cancellationToken)
                .ConfigureAwait(false);
            try
            {
                var responseData = JsonUtils.Deserialize<CompletionFullResponse>(responseBody)!;
                return new WithRawResponse<CompletionFullResponse>()
                {
                    Data = responseData,
                    RawResponse = new SeedApi.RawResponse()
                    {
                        StatusCode = response.Raw.StatusCode,
                        Url = response.Raw.RequestMessage?.RequestUri ?? new Uri("about:blank"),
                        Headers = ResponseHeaders.FromHttpResponseMessage(response.Raw),
                    },
                };
            }
            catch (JsonException e)
            {
                throw new SeedApiApiException(
                    "Failed to deserialize response",
                    response.StatusCode,
                    responseBody,
                    e,
                    rawResponse: new SeedApi.RawResponse()
                    {
                        StatusCode = response.Raw.StatusCode,
                        Url = response.Raw.RequestMessage?.RequestUri ?? new Uri("about:blank"),
                        Headers = ResponseHeaders.FromHttpResponseMessage(response.Raw),
                    }
                );
            }
        }
        {
            var responseBody = await response
                .Raw.Content.ReadAsStringAsync(cancellationToken)
                .ConfigureAwait(false);
            throw new SeedApiApiException(
                $"Error with status code {response.StatusCode}",
                response.StatusCode,
                responseBody,
                rawResponse: new SeedApi.RawResponse()
                {
                    StatusCode = response.Raw.StatusCode,
                    Url = response.Raw.RequestMessage?.RequestUri ?? new Uri("about:blank"),
                    Headers = ResponseHeaders.FromHttpResponseMessage(response.Raw),
                }
            );
        }
    }

    private async Task<
        WithRawResponse<IAsyncEnumerable<CompletionStreamChunk>>
    > StreamXFernStreamingSharedSchemaStreamAsyncCore(
        StreamXFernStreamingSharedSchemaStreamRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        var _headers = await new SeedApi.Core.HeadersBuilder.Builder()
            .Add(_client.Options.Headers)
            .Add(_client.Options.AdditionalHeaders)
            .Add(options?.AdditionalHeaders)
            .BuildAsync()
            .ConfigureAwait(false);
        var response = await _client
            .SendRequestAsync(
                new JsonRequest
                {
                    Method = HttpMethod.Post,
                    Path = "stream/x-fern-streaming-shared-schema",
                    Body = request,
                    Headers = _headers,
                    ContentType = "application/json",
                    Options = options,
                },
                cancellationToken
            )
            .ConfigureAwait(false);
        if (response.StatusCode is >= 200 and < 400)
        {
            return new WithRawResponse<IAsyncEnumerable<CompletionStreamChunk>>()
            {
                Data = StreamXFernStreamingSharedSchemaStreamAsyncBody(response, cancellationToken),
                RawResponse = new SeedApi.RawResponse()
                {
                    StatusCode = response.Raw.StatusCode,
                    Url = response.Raw.RequestMessage?.RequestUri ?? new Uri("about:blank"),
                    Headers = ResponseHeaders.FromHttpResponseMessage(response.Raw),
                },
            };
        }
        {
            var responseBody = await response
                .Raw.Content.ReadAsStringAsync(cancellationToken)
                .ConfigureAwait(false);
            throw new SeedApiApiException(
                $"Error with status code {response.StatusCode}",
                response.StatusCode,
                responseBody,
                rawResponse: new SeedApi.RawResponse()
                {
                    StatusCode = response.Raw.StatusCode,
                    Url = response.Raw.RequestMessage?.RequestUri ?? new Uri("about:blank"),
                    Headers = ResponseHeaders.FromHttpResponseMessage(response.Raw),
                }
            );
        }
    }

    private async IAsyncEnumerable<CompletionStreamChunk> StreamXFernStreamingSharedSchemaStreamAsyncBody(
        ApiResponse response,
        [EnumeratorCancellation] CancellationToken cancellationToken = default
    )
    {
        string? line;
        using var reader = new StreamReader(await response.Raw.Content.ReadAsStreamAsync());
        while (!string.IsNullOrEmpty(line = await reader.ReadLineAsync()))
        {
            CompletionStreamChunk? result;
            try
            {
                result = JsonUtils.Deserialize<CompletionStreamChunk>(line);
            }
            catch (JsonException)
            {
                throw new SeedApiException($"Unable to deserialize JSON response 'line'");
            }
            yield return result!;
        }
    }

    private async Task<
        WithRawResponse<CompletionFullResponse>
    > StreamXFernStreamingSharedSchemaAsyncCore(
        StreamXFernStreamingSharedSchemaRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        var _headers = await new SeedApi.Core.HeadersBuilder.Builder()
            .Add(_client.Options.Headers)
            .Add(_client.Options.AdditionalHeaders)
            .Add(options?.AdditionalHeaders)
            .BuildAsync()
            .ConfigureAwait(false);
        var response = await _client
            .SendRequestAsync(
                new JsonRequest
                {
                    Method = HttpMethod.Post,
                    Path = "stream/x-fern-streaming-shared-schema",
                    Body = request,
                    Headers = _headers,
                    ContentType = "application/json",
                    Options = options,
                },
                cancellationToken
            )
            .ConfigureAwait(false);
        if (response.StatusCode is >= 200 and < 400)
        {
            var responseBody = await response
                .Raw.Content.ReadAsStringAsync(cancellationToken)
                .ConfigureAwait(false);
            try
            {
                var responseData = JsonUtils.Deserialize<CompletionFullResponse>(responseBody)!;
                return new WithRawResponse<CompletionFullResponse>()
                {
                    Data = responseData,
                    RawResponse = new SeedApi.RawResponse()
                    {
                        StatusCode = response.Raw.StatusCode,
                        Url = response.Raw.RequestMessage?.RequestUri ?? new Uri("about:blank"),
                        Headers = ResponseHeaders.FromHttpResponseMessage(response.Raw),
                    },
                };
            }
            catch (JsonException e)
            {
                throw new SeedApiApiException(
                    "Failed to deserialize response",
                    response.StatusCode,
                    responseBody,
                    e,
                    rawResponse: new SeedApi.RawResponse()
                    {
                        StatusCode = response.Raw.StatusCode,
                        Url = response.Raw.RequestMessage?.RequestUri ?? new Uri("about:blank"),
                        Headers = ResponseHeaders.FromHttpResponseMessage(response.Raw),
                    }
                );
            }
        }
        {
            var responseBody = await response
                .Raw.Content.ReadAsStringAsync(cancellationToken)
                .ConfigureAwait(false);
            throw new SeedApiApiException(
                $"Error with status code {response.StatusCode}",
                response.StatusCode,
                responseBody,
                rawResponse: new SeedApi.RawResponse()
                {
                    StatusCode = response.Raw.StatusCode,
                    Url = response.Raw.RequestMessage?.RequestUri ?? new Uri("about:blank"),
                    Headers = ResponseHeaders.FromHttpResponseMessage(response.Raw),
                }
            );
        }
    }

    private async Task<WithRawResponse<CompletionFullResponse>> ValidateCompletionAsyncCore(
        SharedCompletionRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        var _headers = await new SeedApi.Core.HeadersBuilder.Builder()
            .Add(_client.Options.Headers)
            .Add(_client.Options.AdditionalHeaders)
            .Add(options?.AdditionalHeaders)
            .BuildAsync()
            .ConfigureAwait(false);
        var response = await _client
            .SendRequestAsync(
                new JsonRequest
                {
                    Method = HttpMethod.Post,
                    Path = "validate-completion",
                    Body = request,
                    Headers = _headers,
                    ContentType = "application/json",
                    Options = options,
                },
                cancellationToken
            )
            .ConfigureAwait(false);
        if (response.StatusCode is >= 200 and < 400)
        {
            var responseBody = await response
                .Raw.Content.ReadAsStringAsync(cancellationToken)
                .ConfigureAwait(false);
            try
            {
                var responseData = JsonUtils.Deserialize<CompletionFullResponse>(responseBody)!;
                return new WithRawResponse<CompletionFullResponse>()
                {
                    Data = responseData,
                    RawResponse = new SeedApi.RawResponse()
                    {
                        StatusCode = response.Raw.StatusCode,
                        Url = response.Raw.RequestMessage?.RequestUri ?? new Uri("about:blank"),
                        Headers = ResponseHeaders.FromHttpResponseMessage(response.Raw),
                    },
                };
            }
            catch (JsonException e)
            {
                throw new SeedApiApiException(
                    "Failed to deserialize response",
                    response.StatusCode,
                    responseBody,
                    e,
                    rawResponse: new SeedApi.RawResponse()
                    {
                        StatusCode = response.Raw.StatusCode,
                        Url = response.Raw.RequestMessage?.RequestUri ?? new Uri("about:blank"),
                        Headers = ResponseHeaders.FromHttpResponseMessage(response.Raw),
                    }
                );
            }
        }
        {
            var responseBody = await response
                .Raw.Content.ReadAsStringAsync(cancellationToken)
                .ConfigureAwait(false);
            throw new SeedApiApiException(
                $"Error with status code {response.StatusCode}",
                response.StatusCode,
                responseBody,
                rawResponse: new SeedApi.RawResponse()
                {
                    StatusCode = response.Raw.StatusCode,
                    Url = response.Raw.RequestMessage?.RequestUri ?? new Uri("about:blank"),
                    Headers = ResponseHeaders.FromHttpResponseMessage(response.Raw),
                }
            );
        }
    }

    private async Task<
        WithRawResponse<IAsyncEnumerable<CompletionStreamChunk>>
    > StreamXFernStreamingUnionStreamAsyncCore(
        StreamXFernStreamingUnionStreamRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        var _headers = await new SeedApi.Core.HeadersBuilder.Builder()
            .Add(_client.Options.Headers)
            .Add(_client.Options.AdditionalHeaders)
            .Add(options?.AdditionalHeaders)
            .BuildAsync()
            .ConfigureAwait(false);
        var response = await _client
            .SendRequestAsync(
                new JsonRequest
                {
                    Method = HttpMethod.Post,
                    Path = "stream/x-fern-streaming-union",
                    Body = request,
                    Headers = _headers,
                    ContentType = "application/json",
                    Options = options,
                },
                cancellationToken
            )
            .ConfigureAwait(false);
        if (response.StatusCode is >= 200 and < 400)
        {
            return new WithRawResponse<IAsyncEnumerable<CompletionStreamChunk>>()
            {
                Data = StreamXFernStreamingUnionStreamAsyncBody(response, cancellationToken),
                RawResponse = new SeedApi.RawResponse()
                {
                    StatusCode = response.Raw.StatusCode,
                    Url = response.Raw.RequestMessage?.RequestUri ?? new Uri("about:blank"),
                    Headers = ResponseHeaders.FromHttpResponseMessage(response.Raw),
                },
            };
        }
        {
            var responseBody = await response
                .Raw.Content.ReadAsStringAsync(cancellationToken)
                .ConfigureAwait(false);
            throw new SeedApiApiException(
                $"Error with status code {response.StatusCode}",
                response.StatusCode,
                responseBody,
                rawResponse: new SeedApi.RawResponse()
                {
                    StatusCode = response.Raw.StatusCode,
                    Url = response.Raw.RequestMessage?.RequestUri ?? new Uri("about:blank"),
                    Headers = ResponseHeaders.FromHttpResponseMessage(response.Raw),
                }
            );
        }
    }

    private async IAsyncEnumerable<CompletionStreamChunk> StreamXFernStreamingUnionStreamAsyncBody(
        ApiResponse response,
        [EnumeratorCancellation] CancellationToken cancellationToken = default
    )
    {
        string? line;
        using var reader = new StreamReader(await response.Raw.Content.ReadAsStreamAsync());
        while (!string.IsNullOrEmpty(line = await reader.ReadLineAsync()))
        {
            CompletionStreamChunk? result;
            try
            {
                result = JsonUtils.Deserialize<CompletionStreamChunk>(line);
            }
            catch (JsonException)
            {
                throw new SeedApiException($"Unable to deserialize JSON response 'line'");
            }
            yield return result!;
        }
    }

    private async Task<WithRawResponse<CompletionFullResponse>> StreamXFernStreamingUnionAsyncCore(
        StreamXFernStreamingUnionRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        var _headers = await new SeedApi.Core.HeadersBuilder.Builder()
            .Add(_client.Options.Headers)
            .Add(_client.Options.AdditionalHeaders)
            .Add(options?.AdditionalHeaders)
            .BuildAsync()
            .ConfigureAwait(false);
        var response = await _client
            .SendRequestAsync(
                new JsonRequest
                {
                    Method = HttpMethod.Post,
                    Path = "stream/x-fern-streaming-union",
                    Body = request,
                    Headers = _headers,
                    ContentType = "application/json",
                    Options = options,
                },
                cancellationToken
            )
            .ConfigureAwait(false);
        if (response.StatusCode is >= 200 and < 400)
        {
            var responseBody = await response
                .Raw.Content.ReadAsStringAsync(cancellationToken)
                .ConfigureAwait(false);
            try
            {
                var responseData = JsonUtils.Deserialize<CompletionFullResponse>(responseBody)!;
                return new WithRawResponse<CompletionFullResponse>()
                {
                    Data = responseData,
                    RawResponse = new SeedApi.RawResponse()
                    {
                        StatusCode = response.Raw.StatusCode,
                        Url = response.Raw.RequestMessage?.RequestUri ?? new Uri("about:blank"),
                        Headers = ResponseHeaders.FromHttpResponseMessage(response.Raw),
                    },
                };
            }
            catch (JsonException e)
            {
                throw new SeedApiApiException(
                    "Failed to deserialize response",
                    response.StatusCode,
                    responseBody,
                    e,
                    rawResponse: new SeedApi.RawResponse()
                    {
                        StatusCode = response.Raw.StatusCode,
                        Url = response.Raw.RequestMessage?.RequestUri ?? new Uri("about:blank"),
                        Headers = ResponseHeaders.FromHttpResponseMessage(response.Raw),
                    }
                );
            }
        }
        {
            var responseBody = await response
                .Raw.Content.ReadAsStringAsync(cancellationToken)
                .ConfigureAwait(false);
            throw new SeedApiApiException(
                $"Error with status code {response.StatusCode}",
                response.StatusCode,
                responseBody,
                rawResponse: new SeedApi.RawResponse()
                {
                    StatusCode = response.Raw.StatusCode,
                    Url = response.Raw.RequestMessage?.RequestUri ?? new Uri("about:blank"),
                    Headers = ResponseHeaders.FromHttpResponseMessage(response.Raw),
                }
            );
        }
    }

    private async Task<WithRawResponse<ValidateUnionRequestResponse>> ValidateUnionRequestAsyncCore(
        UnionStreamRequestBase request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        var _headers = await new SeedApi.Core.HeadersBuilder.Builder()
            .Add(_client.Options.Headers)
            .Add(_client.Options.AdditionalHeaders)
            .Add(options?.AdditionalHeaders)
            .BuildAsync()
            .ConfigureAwait(false);
        var response = await _client
            .SendRequestAsync(
                new JsonRequest
                {
                    Method = HttpMethod.Post,
                    Path = "validate-union-request",
                    Body = request,
                    Headers = _headers,
                    Options = options,
                },
                cancellationToken
            )
            .ConfigureAwait(false);
        if (response.StatusCode is >= 200 and < 400)
        {
            var responseBody = await response
                .Raw.Content.ReadAsStringAsync(cancellationToken)
                .ConfigureAwait(false);
            try
            {
                var responseData = JsonUtils.Deserialize<ValidateUnionRequestResponse>(
                    responseBody
                )!;
                return new WithRawResponse<ValidateUnionRequestResponse>()
                {
                    Data = responseData,
                    RawResponse = new SeedApi.RawResponse()
                    {
                        StatusCode = response.Raw.StatusCode,
                        Url = response.Raw.RequestMessage?.RequestUri ?? new Uri("about:blank"),
                        Headers = ResponseHeaders.FromHttpResponseMessage(response.Raw),
                    },
                };
            }
            catch (JsonException e)
            {
                throw new SeedApiApiException(
                    "Failed to deserialize response",
                    response.StatusCode,
                    responseBody,
                    e,
                    rawResponse: new SeedApi.RawResponse()
                    {
                        StatusCode = response.Raw.StatusCode,
                        Url = response.Raw.RequestMessage?.RequestUri ?? new Uri("about:blank"),
                        Headers = ResponseHeaders.FromHttpResponseMessage(response.Raw),
                    }
                );
            }
        }
        {
            var responseBody = await response
                .Raw.Content.ReadAsStringAsync(cancellationToken)
                .ConfigureAwait(false);
            throw new SeedApiApiException(
                $"Error with status code {response.StatusCode}",
                response.StatusCode,
                responseBody,
                rawResponse: new SeedApi.RawResponse()
                {
                    StatusCode = response.Raw.StatusCode,
                    Url = response.Raw.RequestMessage?.RequestUri ?? new Uri("about:blank"),
                    Headers = ResponseHeaders.FromHttpResponseMessage(response.Raw),
                }
            );
        }
    }

    private async Task<
        WithRawResponse<IAsyncEnumerable<CompletionStreamChunk>>
    > StreamXFernStreamingNullableConditionStreamAsyncCore(
        StreamXFernStreamingNullableConditionStreamRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        var _headers = await new SeedApi.Core.HeadersBuilder.Builder()
            .Add(_client.Options.Headers)
            .Add(_client.Options.AdditionalHeaders)
            .Add(options?.AdditionalHeaders)
            .BuildAsync()
            .ConfigureAwait(false);
        var response = await _client
            .SendRequestAsync(
                new JsonRequest
                {
                    Method = HttpMethod.Post,
                    Path = "stream/x-fern-streaming-nullable-condition",
                    Body = request,
                    Headers = _headers,
                    ContentType = "application/json",
                    Options = options,
                },
                cancellationToken
            )
            .ConfigureAwait(false);
        if (response.StatusCode is >= 200 and < 400)
        {
            return new WithRawResponse<IAsyncEnumerable<CompletionStreamChunk>>()
            {
                Data = StreamXFernStreamingNullableConditionStreamAsyncBody(
                    response,
                    cancellationToken
                ),
                RawResponse = new SeedApi.RawResponse()
                {
                    StatusCode = response.Raw.StatusCode,
                    Url = response.Raw.RequestMessage?.RequestUri ?? new Uri("about:blank"),
                    Headers = ResponseHeaders.FromHttpResponseMessage(response.Raw),
                },
            };
        }
        {
            var responseBody = await response
                .Raw.Content.ReadAsStringAsync(cancellationToken)
                .ConfigureAwait(false);
            throw new SeedApiApiException(
                $"Error with status code {response.StatusCode}",
                response.StatusCode,
                responseBody,
                rawResponse: new SeedApi.RawResponse()
                {
                    StatusCode = response.Raw.StatusCode,
                    Url = response.Raw.RequestMessage?.RequestUri ?? new Uri("about:blank"),
                    Headers = ResponseHeaders.FromHttpResponseMessage(response.Raw),
                }
            );
        }
    }

    private async IAsyncEnumerable<CompletionStreamChunk> StreamXFernStreamingNullableConditionStreamAsyncBody(
        ApiResponse response,
        [EnumeratorCancellation] CancellationToken cancellationToken = default
    )
    {
        string? line;
        using var reader = new StreamReader(await response.Raw.Content.ReadAsStreamAsync());
        while (!string.IsNullOrEmpty(line = await reader.ReadLineAsync()))
        {
            CompletionStreamChunk? result;
            try
            {
                result = JsonUtils.Deserialize<CompletionStreamChunk>(line);
            }
            catch (JsonException)
            {
                throw new SeedApiException($"Unable to deserialize JSON response 'line'");
            }
            yield return result!;
        }
    }

    private async Task<
        WithRawResponse<CompletionFullResponse>
    > StreamXFernStreamingNullableConditionAsyncCore(
        StreamXFernStreamingNullableConditionRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        var _headers = await new SeedApi.Core.HeadersBuilder.Builder()
            .Add(_client.Options.Headers)
            .Add(_client.Options.AdditionalHeaders)
            .Add(options?.AdditionalHeaders)
            .BuildAsync()
            .ConfigureAwait(false);
        var response = await _client
            .SendRequestAsync(
                new JsonRequest
                {
                    Method = HttpMethod.Post,
                    Path = "stream/x-fern-streaming-nullable-condition",
                    Body = request,
                    Headers = _headers,
                    ContentType = "application/json",
                    Options = options,
                },
                cancellationToken
            )
            .ConfigureAwait(false);
        if (response.StatusCode is >= 200 and < 400)
        {
            var responseBody = await response
                .Raw.Content.ReadAsStringAsync(cancellationToken)
                .ConfigureAwait(false);
            try
            {
                var responseData = JsonUtils.Deserialize<CompletionFullResponse>(responseBody)!;
                return new WithRawResponse<CompletionFullResponse>()
                {
                    Data = responseData,
                    RawResponse = new SeedApi.RawResponse()
                    {
                        StatusCode = response.Raw.StatusCode,
                        Url = response.Raw.RequestMessage?.RequestUri ?? new Uri("about:blank"),
                        Headers = ResponseHeaders.FromHttpResponseMessage(response.Raw),
                    },
                };
            }
            catch (JsonException e)
            {
                throw new SeedApiApiException(
                    "Failed to deserialize response",
                    response.StatusCode,
                    responseBody,
                    e,
                    rawResponse: new SeedApi.RawResponse()
                    {
                        StatusCode = response.Raw.StatusCode,
                        Url = response.Raw.RequestMessage?.RequestUri ?? new Uri("about:blank"),
                        Headers = ResponseHeaders.FromHttpResponseMessage(response.Raw),
                    }
                );
            }
        }
        {
            var responseBody = await response
                .Raw.Content.ReadAsStringAsync(cancellationToken)
                .ConfigureAwait(false);
            throw new SeedApiApiException(
                $"Error with status code {response.StatusCode}",
                response.StatusCode,
                responseBody,
                rawResponse: new SeedApi.RawResponse()
                {
                    StatusCode = response.Raw.StatusCode,
                    Url = response.Raw.RequestMessage?.RequestUri ?? new Uri("about:blank"),
                    Headers = ResponseHeaders.FromHttpResponseMessage(response.Raw),
                }
            );
        }
    }

    private async Task<
        WithRawResponse<IAsyncEnumerable<string>>
    > StreamXFernStreamingSseOnlyAsyncCore(
        StreamRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        var _headers = await new SeedApi.Core.HeadersBuilder.Builder()
            .Add(_client.Options.Headers)
            .Add(_client.Options.AdditionalHeaders)
            .Add(options?.AdditionalHeaders)
            .BuildAsync()
            .ConfigureAwait(false);
        var response = await _client
            .SendRequestAsync(
                new JsonRequest
                {
                    Method = HttpMethod.Post,
                    Path = "stream/x-fern-streaming-sse-only",
                    Body = request,
                    Headers = _headers,
                    Options = options,
                },
                cancellationToken
            )
            .ConfigureAwait(false);
        if (response.StatusCode is >= 200 and < 400)
        {
            return new WithRawResponse<IAsyncEnumerable<string>>()
            {
                Data = StreamXFernStreamingSseOnlyAsyncBody(response, cancellationToken),
                RawResponse = new SeedApi.RawResponse()
                {
                    StatusCode = response.Raw.StatusCode,
                    Url = response.Raw.RequestMessage?.RequestUri ?? new Uri("about:blank"),
                    Headers = ResponseHeaders.FromHttpResponseMessage(response.Raw),
                },
            };
        }
        {
            var responseBody = await response
                .Raw.Content.ReadAsStringAsync(cancellationToken)
                .ConfigureAwait(false);
            throw new SeedApiApiException(
                $"Error with status code {response.StatusCode}",
                response.StatusCode,
                responseBody,
                rawResponse: new SeedApi.RawResponse()
                {
                    StatusCode = response.Raw.StatusCode,
                    Url = response.Raw.RequestMessage?.RequestUri ?? new Uri("about:blank"),
                    Headers = ResponseHeaders.FromHttpResponseMessage(response.Raw),
                }
            );
        }
    }

    private async IAsyncEnumerable<string> StreamXFernStreamingSseOnlyAsyncBody(
        ApiResponse response,
        [EnumeratorCancellation] CancellationToken cancellationToken = default
    )
    {
        await foreach (
            var item in SseParser
                .Create(await response.Raw.Content.ReadAsStreamAsync())
                .EnumerateAsync(cancellationToken)
        )
        {
            if (!string.IsNullOrEmpty(item.Data))
            {
                string? result;
                try
                {
                    result = JsonUtils.Deserialize<string>(item.Data);
                }
                catch (JsonException)
                {
                    throw new SeedApiException($"Unable to deserialize JSON response 'item.Data'");
                }
                yield return result!;
            }
        }
    }

    /// <summary>
    /// Uses discriminator with mapping, x-fern-discriminator-context set to protocol. Because the discriminant is at the protocol level, the data field can be any type or absent entirely. Demonstrates heartbeat (no data), string literal, number literal, and object data payloads.
    /// </summary>
    /// <example><code>
    /// client.StreamProtocolNoCollisionAsync(new StreamRequest());
    /// </code></example>
    public WithRawResponseStream<StreamProtocolNoCollisionResponse> StreamProtocolNoCollisionAsync(
        StreamRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        return new WithRawResponseStream<StreamProtocolNoCollisionResponse>(
            StreamProtocolNoCollisionAsyncCore(request, options, cancellationToken),
            cancellationToken
        );
    }

    /// <summary>
    /// Same as endpoint 1, but the object data payload contains its own "event" property, which collides with the SSE envelope's "event" discriminator field. Tests whether generators correctly separate the protocol-level discriminant from the data-level field when context=protocol is specified.
    /// </summary>
    /// <example><code>
    /// client.StreamProtocolCollisionAsync(new StreamRequest());
    /// </code></example>
    public WithRawResponseStream<StreamProtocolCollisionResponse> StreamProtocolCollisionAsync(
        StreamRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        return new WithRawResponseStream<StreamProtocolCollisionResponse>(
            StreamProtocolCollisionAsyncCore(request, options, cancellationToken),
            cancellationToken
        );
    }

    /// <summary>
    /// x-fern-discriminator-context is explicitly set to "data" (the default value). Each variant uses allOf to extend a payload schema and adds the "event" discriminant property at the same level. There is no "data" wrapper. The discriminant and payload fields coexist in a single flat object. This matches the real-world pattern used by customers with context=data.
    /// </summary>
    /// <example><code>
    /// client.StreamDataContextAsync(new StreamRequest());
    /// </code></example>
    public WithRawResponseStream<StreamDataContextResponse> StreamDataContextAsync(
        StreamRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        return new WithRawResponseStream<StreamDataContextResponse>(
            StreamDataContextAsyncCore(request, options, cancellationToken),
            cancellationToken
        );
    }

    /// <summary>
    /// The x-fern-discriminator-context extension is omitted entirely. Tests whether Fern correctly infers the default behavior (context=data) when the extension is absent. Same flat allOf pattern as endpoint 3.
    /// </summary>
    /// <example><code>
    /// client.StreamNoContextAsync(new StreamRequest());
    /// </code></example>
    public WithRawResponseStream<StreamNoContextResponse> StreamNoContextAsync(
        StreamRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        return new WithRawResponseStream<StreamNoContextResponse>(
            StreamNoContextAsyncCore(request, options, cancellationToken),
            cancellationToken
        );
    }

    /// <summary>
    /// Mismatched combination: context=protocol with the flat allOf schema pattern that is normally used with context=data. Shows what happens when the discriminant is declared as protocol-level but the schema uses allOf to flatten the event field alongside payload fields instead of wrapping them in a data field.
    /// </summary>
    /// <example><code>
    /// client.StreamProtocolWithFlatSchemaAsync(new StreamRequest());
    /// </code></example>
    public WithRawResponseStream<StreamProtocolWithFlatSchemaResponse> StreamProtocolWithFlatSchemaAsync(
        StreamRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        return new WithRawResponseStream<StreamProtocolWithFlatSchemaResponse>(
            StreamProtocolWithFlatSchemaAsyncCore(request, options, cancellationToken),
            cancellationToken
        );
    }

    /// <summary>
    /// Mismatched combination: context=data with the envelope+data schema pattern that is normally used with context=protocol. Shows what happens when the discriminant is declared as data-level but the schema separates the event field and data field into an envelope structure.
    /// </summary>
    /// <example><code>
    /// client.StreamDataContextWithEnvelopeSchemaAsync(new StreamRequest());
    /// </code></example>
    public WithRawResponseStream<StreamDataContextWithEnvelopeSchemaResponse> StreamDataContextWithEnvelopeSchemaAsync(
        StreamRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        return new WithRawResponseStream<StreamDataContextWithEnvelopeSchemaResponse>(
            StreamDataContextWithEnvelopeSchemaAsyncCore(request, options, cancellationToken),
            cancellationToken
        );
    }

    /// <summary>
    /// Follows the pattern from the OAS 3.2 specification's own SSE example. The itemSchema extends a base Event schema via $ref and uses inline oneOf variants with const on the event field to distinguish event types. Data fields use contentSchema/contentMediaType for structured payloads. No discriminator object is used. Event type resolution relies on const matching.
    /// </summary>
    /// <example><code>
    /// client.StreamOasSpecNativeAsync(new StreamRequest());
    /// </code></example>
    public WithRawResponseStream<Event> StreamOasSpecNativeAsync(
        StreamRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        return new WithRawResponseStream<Event>(
            StreamOasSpecNativeAsyncCore(request, options, cancellationToken),
            cancellationToken
        );
    }

    /// <summary>
    /// Uses x-fern-streaming extension with stream-condition to split into streaming and non-streaming variants based on a request body field. The request body is a $ref to a named schema. The response and response-stream point to different schemas.
    /// </summary>
    /// <example><code>
    /// client.StreamXFernStreamingConditionStreamAsync(
    ///     new StreamXFernStreamingConditionStreamRequest { Query = "query", Stream = true }
    /// );
    /// </code></example>
    public WithRawResponseStream<CompletionStreamChunk> StreamXFernStreamingConditionStreamAsync(
        StreamXFernStreamingConditionStreamRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        return new WithRawResponseStream<CompletionStreamChunk>(
            StreamXFernStreamingConditionStreamAsyncCore(request, options, cancellationToken),
            cancellationToken
        );
    }

    /// <summary>
    /// Uses x-fern-streaming extension with stream-condition to split into streaming and non-streaming variants based on a request body field. The request body is a $ref to a named schema. The response and response-stream point to different schemas.
    /// </summary>
    /// <example><code>
    /// await client.StreamXFernStreamingConditionAsync(
    ///     new StreamXFernStreamingConditionRequest { Query = "query", Stream = false }
    /// );
    /// </code></example>
    public WithRawResponseTask<CompletionFullResponse> StreamXFernStreamingConditionAsync(
        StreamXFernStreamingConditionRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        return new WithRawResponseTask<CompletionFullResponse>(
            StreamXFernStreamingConditionAsyncCore(request, options, cancellationToken)
        );
    }

    /// <summary>
    /// Uses x-fern-streaming with stream-condition. The request body $ref (SharedCompletionRequest) is also referenced by a separate non-streaming endpoint (/validate-completion). This tests that the shared request schema is not excluded from the context during streaming processing.
    /// </summary>
    /// <example><code>
    /// client.StreamXFernStreamingSharedSchemaStreamAsync(
    ///     new StreamXFernStreamingSharedSchemaStreamRequest
    ///     {
    ///         Prompt = "prompt",
    ///         Model = "model",
    ///         Stream = true,
    ///     }
    /// );
    /// </code></example>
    public WithRawResponseStream<CompletionStreamChunk> StreamXFernStreamingSharedSchemaStreamAsync(
        StreamXFernStreamingSharedSchemaStreamRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        return new WithRawResponseStream<CompletionStreamChunk>(
            StreamXFernStreamingSharedSchemaStreamAsyncCore(request, options, cancellationToken),
            cancellationToken
        );
    }

    /// <summary>
    /// Uses x-fern-streaming with stream-condition. The request body $ref (SharedCompletionRequest) is also referenced by a separate non-streaming endpoint (/validate-completion). This tests that the shared request schema is not excluded from the context during streaming processing.
    /// </summary>
    /// <example><code>
    /// await client.StreamXFernStreamingSharedSchemaAsync(
    ///     new StreamXFernStreamingSharedSchemaRequest
    ///     {
    ///         Prompt = "prompt",
    ///         Model = "model",
    ///         Stream = false,
    ///     }
    /// );
    /// </code></example>
    public WithRawResponseTask<CompletionFullResponse> StreamXFernStreamingSharedSchemaAsync(
        StreamXFernStreamingSharedSchemaRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        return new WithRawResponseTask<CompletionFullResponse>(
            StreamXFernStreamingSharedSchemaAsyncCore(request, options, cancellationToken)
        );
    }

    /// <summary>
    /// A non-streaming endpoint that references the same SharedCompletionRequest schema as endpoint 10. Ensures the shared $ref schema remains available and is not excluded during the streaming endpoint's processing.
    /// </summary>
    /// <example><code>
    /// await client.ValidateCompletionAsync(
    ///     new SharedCompletionRequest { Prompt = "prompt", Model = "model" }
    /// );
    /// </code></example>
    public WithRawResponseTask<CompletionFullResponse> ValidateCompletionAsync(
        SharedCompletionRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        return new WithRawResponseTask<CompletionFullResponse>(
            ValidateCompletionAsyncCore(request, options, cancellationToken)
        );
    }

    /// <summary>
    /// Uses x-fern-streaming with stream-condition where the request body is a discriminated union (oneOf) whose variants inherit the stream condition field (stream_response) from a shared base schema via allOf. Tests that the stream condition property is not duplicated in the generated output when the base schema is expanded into each variant.
    /// </summary>
    /// <example><code>
    /// client.StreamXFernStreamingUnionStreamAsync(
    ///     new StreamXFernStreamingUnionStreamRequest(
    ///         new StreamXFernStreamingUnionStreamRequest.Message(
    ///             new UnionStreamMessageVariant
    ///             {
    ///                 Prompt = "prompt",
    ///                 Message = "message",
    ///                 StreamResponse = true,
    ///             }
    ///         )
    ///     )
    /// );
    /// </code></example>
    public WithRawResponseStream<CompletionStreamChunk> StreamXFernStreamingUnionStreamAsync(
        StreamXFernStreamingUnionStreamRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        return new WithRawResponseStream<CompletionStreamChunk>(
            StreamXFernStreamingUnionStreamAsyncCore(request, options, cancellationToken),
            cancellationToken
        );
    }

    /// <summary>
    /// Uses x-fern-streaming with stream-condition where the request body is a discriminated union (oneOf) whose variants inherit the stream condition field (stream_response) from a shared base schema via allOf. Tests that the stream condition property is not duplicated in the generated output when the base schema is expanded into each variant.
    /// </summary>
    /// <example><code>
    /// await client.StreamXFernStreamingUnionAsync(
    ///     new StreamXFernStreamingUnionRequest(
    ///         new StreamXFernStreamingUnionRequest.Message(
    ///             new UnionStreamMessageVariant
    ///             {
    ///                 Prompt = "prompt",
    ///                 Message = "message",
    ///                 StreamResponse = false,
    ///             }
    ///         )
    ///     )
    /// );
    /// </code></example>
    public WithRawResponseTask<CompletionFullResponse> StreamXFernStreamingUnionAsync(
        StreamXFernStreamingUnionRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        return new WithRawResponseTask<CompletionFullResponse>(
            StreamXFernStreamingUnionAsyncCore(request, options, cancellationToken)
        );
    }

    /// <summary>
    /// References UnionStreamRequestBase directly, ensuring the base schema cannot be excluded from the context. This endpoint exists to verify that shared base schemas used in discriminated union variants with stream-condition remain available.
    /// </summary>
    /// <example><code>
    /// await client.ValidateUnionRequestAsync(new UnionStreamRequestBase { Prompt = "prompt" });
    /// </code></example>
    public WithRawResponseTask<ValidateUnionRequestResponse> ValidateUnionRequestAsync(
        UnionStreamRequestBase request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        return new WithRawResponseTask<ValidateUnionRequestResponse>(
            ValidateUnionRequestAsyncCore(request, options, cancellationToken)
        );
    }

    /// <summary>
    /// Uses x-fern-streaming with stream-condition where the stream field is nullable (type: ["boolean", "null"] in OAS 3.1). Previously, the spread order in the importer caused the nullable type array to overwrite the const literal, producing stream?: true | null instead of stream: true. The const/type override must be spread after the original property.
    /// </summary>
    /// <example><code>
    /// client.StreamXFernStreamingNullableConditionStreamAsync(
    ///     new StreamXFernStreamingNullableConditionStreamRequest { Query = "query", Stream = true }
    /// );
    /// </code></example>
    public WithRawResponseStream<CompletionStreamChunk> StreamXFernStreamingNullableConditionStreamAsync(
        StreamXFernStreamingNullableConditionStreamRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        return new WithRawResponseStream<CompletionStreamChunk>(
            StreamXFernStreamingNullableConditionStreamAsyncCore(
                request,
                options,
                cancellationToken
            ),
            cancellationToken
        );
    }

    /// <summary>
    /// Uses x-fern-streaming with stream-condition where the stream field is nullable (type: ["boolean", "null"] in OAS 3.1). Previously, the spread order in the importer caused the nullable type array to overwrite the const literal, producing stream?: true | null instead of stream: true. The const/type override must be spread after the original property.
    /// </summary>
    /// <example><code>
    /// await client.StreamXFernStreamingNullableConditionAsync(
    ///     new StreamXFernStreamingNullableConditionRequest { Query = "query", Stream = false }
    /// );
    /// </code></example>
    public WithRawResponseTask<CompletionFullResponse> StreamXFernStreamingNullableConditionAsync(
        StreamXFernStreamingNullableConditionRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        return new WithRawResponseTask<CompletionFullResponse>(
            StreamXFernStreamingNullableConditionAsyncCore(request, options, cancellationToken)
        );
    }

    /// <summary>
    /// Uses x-fern-streaming with format: sse but no stream-condition. This represents a stream-only endpoint that always returns SSE. There is no non-streaming variant, and the response is always a stream of chunks.
    /// </summary>
    /// <example><code>
    /// client.StreamXFernStreamingSseOnlyAsync(new StreamRequest());
    /// </code></example>
    public WithRawResponseStream<string> StreamXFernStreamingSseOnlyAsync(
        StreamRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        return new WithRawResponseStream<string>(
            StreamXFernStreamingSseOnlyAsyncCore(request, options, cancellationToken),
            cancellationToken
        );
    }
}
