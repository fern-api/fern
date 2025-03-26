using SeedAudiences.Core;

namespace SeedAudiences.FolderA;

public partial class FolderAClient
{
    private RawClient _client;

    internal FolderAClient(RawClient client)
    {
        _client = client;
        Service = new ServiceClient(_client);
    }

    public ServiceClient Service { get; }
}
