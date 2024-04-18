using SeedServerSentEvents;

namespace SeedServerSentEvents;

public class CompletionsClient
{
    private RawClient _client;

    public CompletionsClient(RawClient client)
    {
        _client = client;
    }

    public async void StreamAsync() { }
}
