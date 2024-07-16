using SeedAudiences.Core;

#nullable enable

namespace SeedAudiences.FolderB;

public class CommonClient
{
    private RawClient _client;

    public CommonClient(RawClient client)
    {
        _client = client;
    }
}
