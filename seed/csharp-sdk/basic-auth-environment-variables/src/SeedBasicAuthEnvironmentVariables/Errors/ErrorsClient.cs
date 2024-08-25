using SeedBasicAuthEnvironmentVariables.Core;

#nullable enable

namespace SeedBasicAuthEnvironmentVariables;

public partial class ErrorsClient
{
    private RawClient _client;

    internal ErrorsClient(RawClient client)
    {
        _client = client;
    }
}
