using SeedAudiences;

#nullable enable

namespace SeedAudiences;

public class CommonsClient
{
    private RawClient _client;

    public CommonsClient(RawClient client)
    {
        _client = client;
    }
}
