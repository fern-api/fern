using SeedExamples.Core;

#nullable enable

namespace SeedExamples.Commons;

public partial class CommonsClient
{
    private RawClient _client;

    internal CommonsClient(RawClient client)
    {
        _client = client;
        Types = new TypesClient(_client);
    }

    public TypesClient Types { get; }
}
