using SeedObjectsWithImports.Core;
using SeedObjectsWithImports.File;

namespace SeedObjectsWithImports;

public partial class FileClient
{
    private RawClient _client;

    internal FileClient(RawClient client)
    {
        _client = client;
        Directory = new DirectoryClient(_client);
    }

    public DirectoryClient Directory { get; }
}
