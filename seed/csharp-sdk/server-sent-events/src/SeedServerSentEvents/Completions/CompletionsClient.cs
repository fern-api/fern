using System.Collections.Generic;
using System.Net.Http;
using System.Net.ServerSentEvents;
using System.Threading;
using SeedServerSentEvents.Core;

namespace SeedServerSentEvents;

public partial class CompletionsClient
{
    private RawClient _client;

    internal CompletionsClient(RawClient client)
    {
        _client = client;
    }

    /// <example><code>
    /// client.Completions.StreamAsync(new StreamCompletionRequest { Query = "query" });
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
                    yield return JsonUtils.Deserialize<StreamedCompletion>(item.Data);
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
