using SeedCsharpNamespaceConflict.Core;

#nullable enable

namespace SeedCsharpNamespaceConflict.A.Aa;

public partial class AaClient
{
    private RawClient _client;

    internal AaClient(RawClient client)
    {
        _client = client;
    }
}
