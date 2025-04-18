using SeedCustomAuth.Core;

namespace SeedCustomAuth;

public partial class ErrorsClient
{
    private RawClient _client;

    internal ErrorsClient(RawClient client)
    {
        _client = client;
    }
}
