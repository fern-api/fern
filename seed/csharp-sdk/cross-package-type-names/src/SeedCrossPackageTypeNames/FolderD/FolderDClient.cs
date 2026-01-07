using SeedCrossPackageTypeNames.Core;

namespace SeedCrossPackageTypeNames.FolderD;

public partial class FolderDClient : IFolderDClient
{
    private RawClient _client;

    internal FolderDClient(RawClient client)
    {
        _client = client;
        Service = new ServiceClient(_client);
    }

    public ServiceClient Service { get; }
}
