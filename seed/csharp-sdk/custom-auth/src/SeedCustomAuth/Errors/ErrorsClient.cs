using SeedCustomAuth.Core;

#nullable enable

namespace SeedCustomAuth;

public class ErrorsClient
{
    private RawClient _client;

    public ErrorsClient(RawClient client)
    {
        _client = client;
    }
}
