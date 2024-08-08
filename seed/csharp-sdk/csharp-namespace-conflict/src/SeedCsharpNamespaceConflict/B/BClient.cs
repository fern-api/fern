using SeedCsharpNamespaceConflict.Core;

#nullable enable

namespace SeedCsharpNamespaceConflict.B;

public class BClient
{
    private RawClient _client;

    public BClient(RawClient client)
    {
        _client = client;
    }
}
