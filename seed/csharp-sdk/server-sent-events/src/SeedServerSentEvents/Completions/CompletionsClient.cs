using System.Net.Http;
using SeedServerSentEvents;
using SeedServerSentEvents.Core;

#nullable enable

namespace SeedServerSentEvents;

public class CompletionsClient
{
    private RawClient _client;

    public CompletionsClient(RawClient client)
    {
        _client = client;
    }

    public async Task StreamAsync(StreamCompletionRequest request)
    {
        var response = await _client.MakeRequestAsync(
            new RawClient.JsonApiRequest
            {
                BaseURL = _client.Options.BaseURL,
                Method = HttpMethod.Post,
                Path = "stream",
                Body = request
            }
        );
    }
}
