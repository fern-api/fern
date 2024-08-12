using SeedCsharpNamespaceConflict.A.Aa;
using SeedCsharpNamespaceConflict.Core;

#nullable enable

namespace SeedCsharpNamespaceConflict.A;

public partial class AClient
{
    private RawClient _client;

    internal AClient(RawClient client)
    {
        _client = client;
        Aa = new AaClient(_client);
    }

    public AaClient Aa { get; }
}
