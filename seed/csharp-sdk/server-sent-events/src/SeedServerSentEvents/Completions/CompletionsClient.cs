using global::System.Net.ServerSentEvents;
using global::System.Runtime.CompilerServices;
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

    private async Task<WithRawResponse<IAsyncEnumerable<StreamedCompletion>>> StreamAsyncCore(
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
            return new WithRawResponse<IAsyncEnumerable<StreamedCompletion>>()
            {
                Data = StreamAsyncBody(response, cancellationToken),
                RawResponse = new SeedServerSentEvents.RawResponse()
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
            throw new SeedServerSentEventsApiException(
                $"Error with status code {response.StatusCode}",
                response.StatusCode,
                responseBody,
                rawResponse: new SeedServerSentEvents.RawResponse()
                {
                    StatusCode = response.Raw.StatusCode,
                    Url = response.Raw.RequestMessage?.RequestUri ?? new Uri("about:blank"),
                    Headers = ResponseHeaders.FromHttpResponseMessage(response.Raw),
                }
            );
        }
    }

    private async IAsyncEnumerable<StreamedCompletion> StreamAsyncBody(
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
                yield return result!;
            }
        }
    }

    private async Task<
        WithRawResponse<IAsyncEnumerable<StreamedCompletion>>
    > StreamWithoutTerminatorAsyncCore(
        StreamCompletionRequestWithoutTerminator request,
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
                    Path = "stream-no-terminator",
                    Body = request,
                    Headers = _headers,
                    Options = options,
                },
                cancellationToken
            )
            .ConfigureAwait(false);
        if (response.StatusCode is >= 200 and < 400)
        {
            return new WithRawResponse<IAsyncEnumerable<StreamedCompletion>>()
            {
                Data = StreamWithoutTerminatorAsyncBody(response, cancellationToken),
                RawResponse = new SeedServerSentEvents.RawResponse()
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
            throw new SeedServerSentEventsApiException(
                $"Error with status code {response.StatusCode}",
                response.StatusCode,
                responseBody,
                rawResponse: new SeedServerSentEvents.RawResponse()
                {
                    StatusCode = response.Raw.StatusCode,
                    Url = response.Raw.RequestMessage?.RequestUri ?? new Uri("about:blank"),
                    Headers = ResponseHeaders.FromHttpResponseMessage(response.Raw),
                }
            );
        }
    }

    private async IAsyncEnumerable<StreamedCompletion> StreamWithoutTerminatorAsyncBody(
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
                yield return result!;
            }
        }
    }

    /// <example><code>
    /// client.Completions.StreamAsync(new StreamCompletionRequest { Query = "foo" });
    /// </code></example>
    public WithRawResponseStream<StreamedCompletion> StreamAsync(
        StreamCompletionRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        return new WithRawResponseStream<StreamedCompletion>(
            StreamAsyncCore(request, options, cancellationToken),
            cancellationToken
        );
    }

    /// <example><code>
    /// client.Completions.StreamWithoutTerminatorAsync(
    ///     new StreamCompletionRequestWithoutTerminator { Query = "query" }
    /// );
    /// </code></example>
    public WithRawResponseStream<StreamedCompletion> StreamWithoutTerminatorAsync(
        StreamCompletionRequestWithoutTerminator request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        return new WithRawResponseStream<StreamedCompletion>(
            StreamWithoutTerminatorAsyncCore(request, options, cancellationToken),
            cancellationToken
        );
    }
}
