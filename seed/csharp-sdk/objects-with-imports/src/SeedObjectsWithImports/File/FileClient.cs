using SeedObjectsWithImports.Core;
using SeedObjectsWithImports.File;

#nullable enable

namespace SeedObjectsWithImports;

public class FileClient
{
    private RawClient _client;

    public FileClient(RawClient client)
    {
        _client = client;
        Directory = new DirectoryClient(_client);
    }

    public DirectoryClient Directory { get; }
}
