using SeedAudiences.Core;

#nullable enable

namespace SeedAudiences.FolderC;

public partial class CommonClient
{
    private RawClient _client;

    internal CommonClient(RawClient client)
    {
        _client = client;
    }
}
