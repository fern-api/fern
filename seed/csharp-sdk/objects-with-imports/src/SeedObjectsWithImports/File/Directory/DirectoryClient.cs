using SeedObjectsWithImports.Core;

namespace SeedObjectsWithImports.File;

public partial class DirectoryClient
{
    private RawClient _client;

    internal DirectoryClient(RawClient client)
    {
        _client = client;
    }
}
