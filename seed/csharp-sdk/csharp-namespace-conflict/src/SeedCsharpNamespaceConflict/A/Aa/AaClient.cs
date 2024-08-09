using SeedCsharpNamespaceConflict.Core;

#nullable enable

namespace SeedCsharpNamespaceConflict.A.Aa;

public class AaClient
{
    private RawClient _client;

    public AaClient(RawClient client)
    {
        _client = client;
    }
}
