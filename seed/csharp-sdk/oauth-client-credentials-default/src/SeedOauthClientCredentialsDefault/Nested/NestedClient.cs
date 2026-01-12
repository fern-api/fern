using SeedOauthClientCredentialsDefault.Core;

namespace SeedOauthClientCredentialsDefault.Nested;

public partial class NestedClient : INestedClient
{
    private RawClient _client;

    internal NestedClient(RawClient client)
    {
        _client = client;
        Api = new ApiClient(_client);
    }

    public ApiClient Api { get; }
}
