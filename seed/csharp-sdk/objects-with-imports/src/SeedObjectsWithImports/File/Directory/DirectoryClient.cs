using SeedObjectsWithImports.Core;

#nullable enable

namespace SeedObjectsWithImports.File;

public class DirectoryClient
{
    private RawClient _client;

    public DirectoryClient(RawClient client)
    {
        _client = client;
    }
}
