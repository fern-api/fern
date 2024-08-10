using SeedExamples.Core;

#nullable enable

namespace SeedExamples.Commons;

public partial class TypesClient
{
    private RawClient _client;

    internal TypesClient(RawClient client)
    {
        _client = client;
    }
}
