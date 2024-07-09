using SeedObjectsWithImports.Core;
using SeedObjectsWithImports.File.Directory;

#nullable enable

namespace SeedObjectsWithImports.File;

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
