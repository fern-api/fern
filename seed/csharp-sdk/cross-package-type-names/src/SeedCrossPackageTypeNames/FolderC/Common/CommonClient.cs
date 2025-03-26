using SeedCrossPackageTypeNames.Core;

namespace SeedCrossPackageTypeNames.FolderC;

public partial class CommonClient
{
    private RawClient _client;

    internal CommonClient(RawClient client)
    {
        _client = client;
    }
}
