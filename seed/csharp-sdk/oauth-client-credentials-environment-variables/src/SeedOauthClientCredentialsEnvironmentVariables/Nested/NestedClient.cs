using SeedOauthClientCredentialsEnvironmentVariables.Core;

namespace SeedOauthClientCredentialsEnvironmentVariables.Nested;

public partial class NestedClient
{
    private RawClient _client;

    internal NestedClient(RawClient client)
    {
        _client = client;
        Api = new ApiClient(_client);
    }

    public ApiClient Api { get; }
}
