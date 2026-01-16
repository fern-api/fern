using SeedOauthClientCredentials.Core;

namespace SeedOauthClientCredentials.NestedNoAuth;

public partial class NestedNoAuthClient : INestedNoAuthClient
{
    private RawClient _client;

    internal NestedNoAuthClient(RawClient client)
    {
        _client = client;
        Api = new ApiClient(_client);
        Raw = new RawAccessClient(_client);
    }

    public ApiClient Api { get; }

    public NestedNoAuthClient.RawAccessClient Raw { get; }

    public partial class RawAccessClient
    {
        private readonly RawClient _client;

        internal RawAccessClient(RawClient client)
        {
            _client = client;
        }
    }
}
