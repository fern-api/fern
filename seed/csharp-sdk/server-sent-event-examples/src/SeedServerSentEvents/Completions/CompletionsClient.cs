using System.Net.ServerSentEvents;
using SeedServerSentEvents.Core;

namespace SeedServerSentEvents;

public partial class CompletionsClient : ICompletionsClient
{
    private RawClient _client;

    internal CompletionsClient(RawClient client)
    {
        _client = client;
        Raw = new RawAccessClient(_client);
    }

    public CompletionsClient.RawAccessClient Raw { get; }

    /// <example><code>
    /// client.Completions.StreamAsync(new StreamCompletionRequest { Query = "foo" });
    /// </code></example>
    public async IAsyncEnumerable<StreamedCompletion> StreamAsync(
        StreamCompletionRequest request,
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
                    Path = "stream",
                    Body = request,
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
                    catch (System.Text.Json.JsonException)
                    {
                        throw new SeedServerSentEventsException(
                            $"Unable to deserialize JSON response 'item.Data'"
                        );
                    }
                    yield return result!;
                }
            }
            yield break;
        }
        {
            var responseBody = await response.Raw.Content.ReadAsStringAsync();
            throw new SeedServerSentEventsApiException(
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

        public async Task<WithRawResponse<IAsyncEnumerable<StreamedCompletion>>> StreamAsync(
            StreamCompletionRequest request,
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
                        Path = "stream",
                        Body = request,
                        Options = options,
                    },
                    cancellationToken
                )
                .ConfigureAwait(false);
            // Streaming responses are not supported for raw access
            throw new SeedServerSentEventsException(
                "Streaming responses are not supported for raw access"
            );
            {
                var responseBody = await response.Raw.Content.ReadAsStringAsync();
                throw new SeedServerSentEventsApiException(
                    $"Error with status code {response.StatusCode}",
                    response.StatusCode,
                    responseBody
                );
            }
        }
    }
}
