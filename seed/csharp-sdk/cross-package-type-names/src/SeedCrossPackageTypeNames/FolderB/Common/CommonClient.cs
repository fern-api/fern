using SeedCrossPackageTypeNames.Core;

namespace SeedCrossPackageTypeNames.FolderB;

public partial class CommonClient
{
    private RawClient _client;

    internal CommonClient(RawClient client)
    {
        _client = client;
    }
}
