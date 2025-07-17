using SeedExhaustive.Core;

namespace SeedExhaustive.Types.Docs;

public partial class DocsClient
{
    private RawClient _client;

    internal DocsClient(RawClient client)
    {
        _client = client;
    }
}
