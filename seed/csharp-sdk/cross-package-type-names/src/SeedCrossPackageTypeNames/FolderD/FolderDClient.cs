using SeedCrossPackageTypeNames.Core;

namespace SeedCrossPackageTypeNames.FolderD;

public partial class FolderDClient : IFolderDClient
{
    private RawClient _client;

    internal FolderDClient(RawClient client)
    {
        _client = client;
        Service = new ServiceClient(_client);
        Raw = new RawAccessClient(_client);
    }

    public ServiceClient Service { get; }

    public FolderDClient.RawAccessClient Raw { get; }

    public partial class RawAccessClient
    {
        private readonly RawClient _client;

        internal RawAccessClient(RawClient client)
        {
            _client = client;
        }
    }
}
