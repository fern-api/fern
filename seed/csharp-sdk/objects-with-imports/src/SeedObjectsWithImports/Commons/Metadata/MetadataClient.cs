using SeedObjectsWithImports.Core;

#nullable enable

namespace SeedObjectsWithImports.Commons;

public partial class MetadataClient
{
    private RawClient _client;

    internal MetadataClient(RawClient client)
    {
        _client = client;
    }
}
