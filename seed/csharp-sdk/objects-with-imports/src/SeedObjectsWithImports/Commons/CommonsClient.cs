using SeedObjectsWithImports.Commons;
using SeedObjectsWithImports.Core;

#nullable enable

namespace SeedObjectsWithImports.Commons;

public class CommonsClient
{
    private RawClient _client;

    public CommonsClient(RawClient client)
    {
        _client = client;
        Metadata = new MetadataClient(_client);
    }

    public MetadataClient Metadata { get; }
}
