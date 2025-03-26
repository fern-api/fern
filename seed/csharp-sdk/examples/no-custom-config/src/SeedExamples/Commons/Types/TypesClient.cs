using SeedExamples.Core;

namespace SeedExamples.Commons;

public partial class TypesClient
{
    private RawClient _client;

    internal TypesClient(RawClient client)
    {
        _client = client;
    }
}
