using SeedObjectsWithImports.Core;

namespace SeedObjectsWithImports.Commons;

public partial class CommonsClient
{
    private RawClient _client;

    internal CommonsClient(RawClient client)
    {
        _client = client;
        Metadata = new MetadataClient(_client);
    }

    public MetadataClient Metadata { get; }
}
