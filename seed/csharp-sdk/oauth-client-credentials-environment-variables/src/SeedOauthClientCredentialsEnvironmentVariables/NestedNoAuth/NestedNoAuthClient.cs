using SeedOauthClientCredentialsEnvironmentVariables.Core;

namespace SeedOauthClientCredentialsEnvironmentVariables.NestedNoAuth;

public partial class NestedNoAuthClient : INestedNoAuthClient
{
    private RawClient _client;

    internal NestedNoAuthClient(RawClient client)
    {
        _client = client;
        Api = new ApiClient(_client);
        Raw = new WithRawResponseClient(_client);
    }

    public ApiClient Api { get; }

    public NestedNoAuthClient.WithRawResponseClient Raw { get; }

    public partial class WithRawResponseClient
    {
        private readonly RawClient _client;

        internal WithRawResponseClient(RawClient client)
        {
            _client = client;
        }
    }
}
