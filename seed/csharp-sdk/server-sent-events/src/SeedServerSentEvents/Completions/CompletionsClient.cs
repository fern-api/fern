using System.Collections.Generic;
using System.Net.Http;
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
    /// await client.Completions.StreamAsync(new StreamCompletionRequest { Query = "query" });
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
            string? line;
            using var reader = new StreamReader(await response.Raw.Content.ReadAsStreamAsync());
            while (!string.IsNullOrEmpty(line = await reader.ReadLineAsync()))
            {
                var chunk = (StreamedCompletion?)null;
                try
                {
                    chunk = JsonUtils.Deserialize<StreamedCompletion>(line);
                }
                catch (JsonException)
                {
                    throw new SeedServerSentEventsException(
                        $"Unable to deserialize JSON response '{line}'"
                    );
                }
                if (chunk is not null)
                {
                    yield return chunk;
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
