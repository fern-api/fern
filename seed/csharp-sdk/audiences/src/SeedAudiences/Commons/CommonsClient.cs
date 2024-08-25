using SeedAudiences.Core;

#nullable enable

namespace SeedAudiences;

public partial class CommonsClient
{
    private RawClient _client;

    internal CommonsClient(RawClient client)
    {
        _client = client;
    }
}
