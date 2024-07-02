using SeedBasicAuthEnvironmentVariables.Core;

#nullable enable

namespace SeedBasicAuthEnvironmentVariables;

public class ErrorsClient
{
    private RawClient _client;

    public ErrorsClient(RawClient client)
    {
        _client = client;
    }
}
