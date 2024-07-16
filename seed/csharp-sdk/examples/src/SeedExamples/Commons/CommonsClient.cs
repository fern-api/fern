using SeedExamples.Commons;
using SeedExamples.Core;

#nullable enable

namespace SeedExamples.Commons;

public class CommonsClient
{
    private RawClient _client;

    public CommonsClient(RawClient client)
    {
        _client = client;
        Types = new TypesClient(_client);
    }

    public TypesClient Types { get; }
}
