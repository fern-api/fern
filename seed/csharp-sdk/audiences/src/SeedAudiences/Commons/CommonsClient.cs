using SeedAudiences.Core;

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
