using System.Net.Http;
using System.Threading;
using global::System.Threading.Tasks;
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
    /// await client.Completions.StreamAsync(new StreamCompletionRequest { Query = "foo" });
    /// </code></example>
    public async global::System.Threading.Tasks.Task StreamAsync(
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
        /* SSE Not currently implemented */
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
