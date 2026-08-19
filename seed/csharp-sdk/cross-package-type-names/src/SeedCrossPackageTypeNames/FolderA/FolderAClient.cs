using SeedCrossPackageTypeNames.Core;

namespace SeedCrossPackageTypeNames.FolderA;

public partial class FolderAClient : IFolderAClient
{
    private readonly RawClient _client;

    internal FolderAClient(RawClient client)
    {
        _client = client;
        Service = new ServiceClient(_client);
    }

    public IServiceClient Service { get; }
}
