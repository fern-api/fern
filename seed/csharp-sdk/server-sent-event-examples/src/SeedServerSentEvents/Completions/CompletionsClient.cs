using System.Net.ServerSentEvents;
using SeedServerSentEvents.Core;

namespace SeedServerSentEvents;

public partial class CompletionsClient : ICompletionsClient
{
    private RawClient _client;

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
                    BaseUrl = _client.Options.BaseUrl,
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
                    catch (System.Text.Json.JsonException)
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
            var responseBody = await response.Raw.Content.ReadAsStringAsync();
            throw new SeedServerSentEventsApiException(
                $"Error with status code {response.StatusCode}",
                response.StatusCode,
                responseBody
            );
        }
    }
}
