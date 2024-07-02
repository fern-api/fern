using SeedBasicAuth.Core;

#nullable enable

namespace SeedBasicAuth;

public class ErrorsClient
{
    private RawClient _client;

    public ErrorsClient(RawClient client)
    {
        _client = client;
    }
}
