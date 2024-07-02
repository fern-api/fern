using SeedAudiences.Core;
using SeedAudiences.FolderC;

#nullable enable

namespace SeedAudiences.FolderC;

public class FolderCClient
{
    private RawClient _client;

    public FolderCClient(RawClient client)
    {
        _client = client;
        Common = new CommonClient(_client);
    }

    public CommonClient Common { get; }
}
