using SeedObjectsWithImports;

namespace SeedObjectsWithImports.Commons;

public class MetadataClient
{
    private RawClient _client;

    public MetadataClient(RawClient client)
    {
        _client = client;
    }
}
