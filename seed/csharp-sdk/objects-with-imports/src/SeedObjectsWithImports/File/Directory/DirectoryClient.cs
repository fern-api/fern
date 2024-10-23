using SeedObjectsWithImports.Core;

#nullable enable

namespace SeedObjectsWithImports.File;

public partial class DirectoryClient
{
    private RawClient _client;

    internal DirectoryClient(RawClient client)
    {
        _client = client;
    }
}
