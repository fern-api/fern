using SeedCustomAuth.Core;

#nullable enable

namespace SeedCustomAuth;

public partial class ErrorsClient
{
    private RawClient _client;

    internal ErrorsClient(RawClient client)
    {
        _client = client;
    }
}
