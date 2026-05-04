using global::System.Net.ServerSentEvents;
using global::System.Text.Json;
using SeedServerSentEvents.Core;

namespace SeedServerSentEvents;

public partial class CompletionsClient : ICompletionsClient
{
    private readonly RawClient _client;

    internal CompletionsClient(RawClient client)
    {
        _client = client;
    }

    /// <example><code>
    /// client.Completions.StreamAsync(new StreamCompletionRequest { Query = "foo" });
    /// </code></example>
    public async IAsyncEnumerable<StreamedCompletion> StreamAsync(
        StreamCompletionRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        var _headers = await new SeedServerSentEvents.Core.HeadersBuilder.Builder()
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
                    Path = "stream",
                    Body = request,
                    Headers = _headers,
                    Options = options,
                },
                cancellationToken
            )
            .ConfigureAwait(false);
        if (response.StatusCode is >= 200 and < 400)
        {
            await foreach (
                var item in SseParser
                    .Create(await response.Raw.Content.ReadAsStreamAsync())
                    .EnumerateAsync(cancellationToken)
            )
            {
                if (!string.IsNullOrEmpty(item.Data))
                {
                    if (item.Data == "[[DONE]]")
                    {
                        break;
                    }
                    StreamedCompletion? result;
                    try
                    {
                        result = JsonUtils.Deserialize<StreamedCompletion>(item.Data);
                    }
                    catch (JsonException)
                    {
                        throw new SeedServerSentEventsException(
                            $"Unable to deserialize JSON response 'item.Data'"
                        );
                    }
                }
            }
            yield break;
        }
        {
            var responseBody = await response
                .Raw.Content.ReadAsStringAsync(cancellationToken)
                .ConfigureAwait(false);
            try
            {
                switch (response.StatusCode)
                {
                    case 400:
                        throw new BadRequestError(JsonUtils.Deserialize<string>(responseBody));
                }
            }
            catch (JsonException)
            {
                // unable to map error response, throwing generic error
            }
            throw new SeedServerSentEventsApiException(
                $"Error with status code {response.StatusCode}",
                response.StatusCode,
                responseBody
            );
        }
    }

    /// <example><code>
    /// client.Completions.StreamEventsAsync(new StreamEventsRequest { Query = "query" });
    /// </code></example>
    public async IAsyncEnumerable<StreamEvent> StreamEventsAsync(
        StreamEventsRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        var _headers = await new SeedServerSentEvents.Core.HeadersBuilder.Builder()
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
                    Path = "stream-events",
                    Body = request,
                    Headers = _headers,
                    Options = options,
                },
                cancellationToken
            )
            .ConfigureAwait(false);
        if (response.StatusCode is >= 200 and < 400)
        {
            await foreach (
                var item in SseParser
                    .Create(await response.Raw.Content.ReadAsStreamAsync())
                    .EnumerateAsync(cancellationToken)
            )
            {
                if (!string.IsNullOrEmpty(item.Data))
                {
                    if (item.Data == "[DONE]")
                    {
                        break;
                    }
                    StreamEvent? result;
                    try
                    {
                        result = JsonUtils.Deserialize<StreamEvent>(item.Data);
                    }
                    catch (JsonException)
                    {
                        throw new SeedServerSentEventsException(
                            $"Unable to deserialize JSON response 'item.Data'"
                        );
                    }
                }
            }
            yield break;
        }
        {
            var responseBody = await response
                .Raw.Content.ReadAsStringAsync(cancellationToken)
                .ConfigureAwait(false);
            try
            {
                switch (response.StatusCode)
                {
                    case 400:
                        throw new BadRequestError(JsonUtils.Deserialize<string>(responseBody));
                }
            }
            catch (JsonException)
            {
                // unable to map error response, throwing generic error
            }
            throw new SeedServerSentEventsApiException(
                $"Error with status code {response.StatusCode}",
                response.StatusCode,
                responseBody
            );
        }
    }

    /// <example><code>
    /// client.Completions.StreamEventsDiscriminantInDataAsync(
    ///     new StreamEventsDiscriminantInDataRequest { Query = "query" }
    /// );
    /// </code></example>
    public async IAsyncEnumerable<StreamEventDiscriminantInData> StreamEventsDiscriminantInDataAsync(
        StreamEventsDiscriminantInDataRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        var _headers = await new SeedServerSentEvents.Core.HeadersBuilder.Builder()
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
                    Path = "stream-events-discriminant-in-data",
                    Body = request,
                    Headers = _headers,
                    Options = options,
                },
                cancellationToken
            )
            .ConfigureAwait(false);
        if (response.StatusCode is >= 200 and < 400)
        {
            await foreach (
                var item in SseParser
                    .Create(await response.Raw.Content.ReadAsStreamAsync())
                    .EnumerateAsync(cancellationToken)
            )
            {
                if (!string.IsNullOrEmpty(item.Data))
                {
                    StreamEventDiscriminantInData? result;
                    try
                    {
                        result = JsonUtils.Deserialize<StreamEventDiscriminantInData>(item.Data);
                    }
                    catch (JsonException)
                    {
                        throw new SeedServerSentEventsException(
                            $"Unable to deserialize JSON response 'item.Data'"
                        );
                    }
                }
            }
            yield break;
        }
        {
            var responseBody = await response
                .Raw.Content.ReadAsStringAsync(cancellationToken)
                .ConfigureAwait(false);
            try
            {
                switch (response.StatusCode)
                {
                    case 400:
                        throw new BadRequestError(JsonUtils.Deserialize<string>(responseBody));
                }
            }
            catch (JsonException)
            {
                // unable to map error response, throwing generic error
            }
            throw new SeedServerSentEventsApiException(
                $"Error with status code {response.StatusCode}",
                response.StatusCode,
                responseBody
            );
        }
    }

    /// <example><code>
    /// client.Completions.StreamEventsContextProtocolAsync(
    ///     new StreamEventsContextProtocolRequest { Query = "query" }
    /// );
    /// </code></example>
    public async IAsyncEnumerable<StreamEventContextProtocol> StreamEventsContextProtocolAsync(
        StreamEventsContextProtocolRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        var _headers = await new SeedServerSentEvents.Core.HeadersBuilder.Builder()
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
                    Path = "stream-events-context-protocol",
                    Body = request,
                    Headers = _headers,
                    Options = options,
                },
                cancellationToken
            )
            .ConfigureAwait(false);
        if (response.StatusCode is >= 200 and < 400)
        {
            await foreach (
                var item in SseParser
                    .Create(await response.Raw.Content.ReadAsStreamAsync())
                    .EnumerateAsync(cancellationToken)
            )
            {
                if (!string.IsNullOrEmpty(item.Data))
                {
                    if (item.Data == "[DONE]")
                    {
                        break;
                    }
                    StreamEventContextProtocol? result;
                    try
                    {
                        result = JsonUtils.Deserialize<StreamEventContextProtocol>(item.Data);
                    }
                    catch (JsonException)
                    {
                        throw new SeedServerSentEventsException(
                            $"Unable to deserialize JSON response 'item.Data'"
                        );
                    }
                }
            }
            yield break;
        }
        {
            var responseBody = await response
                .Raw.Content.ReadAsStringAsync(cancellationToken)
                .ConfigureAwait(false);
            try
            {
                switch (response.StatusCode)
                {
                    case 400:
                        throw new BadRequestError(JsonUtils.Deserialize<string>(responseBody));
                }
            }
            catch (JsonException)
            {
                // unable to map error response, throwing generic error
            }
            throw new SeedServerSentEventsApiException(
                $"Error with status code {response.StatusCode}",
                response.StatusCode,
                responseBody
            );
        }
    }
}
