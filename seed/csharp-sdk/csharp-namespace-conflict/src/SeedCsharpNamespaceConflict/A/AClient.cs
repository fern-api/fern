using SeedCsharpNamespaceConflict.Core;

#nullable enable

namespace SeedCsharpNamespaceConflict.A;

public class AClient
{
    private RawClient _client;

    public AClient(RawClient client)
    {
        _client = client;
    }
}
