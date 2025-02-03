using SeedCsharpNamespaceConflict.Core;

namespace SeedCsharpNamespaceConflict.B;

public partial class BClient
{
    private RawClient _client;

    internal BClient(RawClient client)
    {
        _client = client;
    }
}
