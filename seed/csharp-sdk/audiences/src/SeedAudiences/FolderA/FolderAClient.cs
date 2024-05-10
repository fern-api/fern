using SeedAudiences;
using SeedAudiences.FolderA;

namespace SeedAudiences.FolderA;

public class FolderAClient
{
    private RawClient _client;

    public FolderAClient(RawClient client)
    {
        _client = client;
        Service = new ServiceClient(_client);
    }

    public ServiceClient Service { get; }
}
