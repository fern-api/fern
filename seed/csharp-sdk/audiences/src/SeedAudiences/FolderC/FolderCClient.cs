using SeedAudiences.Core;

namespace SeedAudiences.FolderC;

public partial class FolderCClient
{
    private RawClient _client;

    internal FolderCClient(RawClient client)
    {
        _client = client;
        Common = new CommonClient(_client);
    }

    public CommonClient Common { get; }
}
