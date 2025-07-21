using SeedExhaustive.Core;

namespace SeedExhaustive.Types;

public partial class DocsClient
{
    private RawClient _client;

    internal DocsClient(RawClient client)
    {
        _client = client;
    }
}
