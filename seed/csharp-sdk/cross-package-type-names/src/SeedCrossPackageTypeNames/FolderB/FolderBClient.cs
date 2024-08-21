using SeedCrossPackageTypeNames.Core;

#nullable enable

namespace SeedCrossPackageTypeNames.FolderB;

public partial class FolderBClient
{
    private RawClient _client;

    internal FolderBClient(RawClient client)
    {
        _client = client;
        Common = new CommonClient(_client);
    }

    public CommonClient Common { get; }
}
