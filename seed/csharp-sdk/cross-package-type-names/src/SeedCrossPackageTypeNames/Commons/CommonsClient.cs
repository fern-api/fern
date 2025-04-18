using SeedCrossPackageTypeNames.Core;

namespace SeedCrossPackageTypeNames;

public partial class CommonsClient
{
    private RawClient _client;

    internal CommonsClient(RawClient client)
    {
        _client = client;
    }
}
