using SeedExamples.Core;

#nullable enable

namespace SeedExamples.Commons;

public class TypesClient
{
    private RawClient _client;

    public TypesClient(RawClient client)
    {
        _client = client;
    }
}
