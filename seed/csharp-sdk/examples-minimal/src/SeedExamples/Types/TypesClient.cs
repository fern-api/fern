using SeedExamples.Core;

namespace SeedExamples;

public partial class TypesClient
{
    private RawClient _client;

    internal TypesClient(RawClient client)
    {
        _client = client;
    }
}
