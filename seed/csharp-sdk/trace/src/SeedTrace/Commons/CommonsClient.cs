using SeedTrace.Core;

#nullable enable

namespace SeedTrace;

public partial class CommonsClient
{
    private RawClient _client;

    internal CommonsClient(RawClient client)
    {
        _client = client;
    }
}
