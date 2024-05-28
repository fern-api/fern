using SeedServerSentEvents;

#nullable enable

namespace SeedServerSentEvents;

public class CompletionsClient
{
    private RawClient _client;

    public CompletionsClient(RawClient client)
    {
        _client = client;
    }

    public async void StreamAsync(StreamCompletionRequest request)
    {
        var response = await _client.MakeRequestAsync(
            new RawClient.ApiRequest
            {
                Method = HttpMethod.Post,
                Path = "/stream",
                Body = request
            }
        );
    }
}
