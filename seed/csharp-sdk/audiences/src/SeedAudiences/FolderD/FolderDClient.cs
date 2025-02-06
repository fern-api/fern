using SeedAudiences.Core;

namespace SeedAudiences.FolderD;

public partial class FolderDClient
{
    private RawClient _client;

    internal FolderDClient(RawClient client)
    {
        _client = client;
        Service = new ServiceClient(_client);
    }

    public ServiceClient Service { get; }
}
