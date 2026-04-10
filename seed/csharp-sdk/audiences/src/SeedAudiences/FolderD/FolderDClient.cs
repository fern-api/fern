using SeedAudiences.Core;

namespace SeedAudiences.FolderD;

public partial class FolderDClient : IFolderDClient
{
    private readonly RawClient _client;

    internal FolderDClient(RawClient client)
    {
        _client = client;
        Service = new ServiceClient(_client);
    }

    public IServiceClient Service { get; }
}
