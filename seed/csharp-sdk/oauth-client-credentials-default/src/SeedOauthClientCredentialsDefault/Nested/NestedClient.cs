using SeedOauthClientCredentialsDefault.Core;

namespace SeedOauthClientCredentialsDefault.Nested;

public partial class NestedClient : INestedClient
{
    private RawClient _client;

    internal NestedClient(RawClient client)
    {
        _client = client;
        Api = new ApiClient(_client);
        Raw = new RawAccessClient(_client);
    }

    public ApiClient Api { get; }

    public NestedClient.RawAccessClient Raw { get; }

    public partial class RawAccessClient
    {
        private readonly RawClient _client;

        internal RawAccessClient(RawClient client)
        {
            _client = client;
        }
    }
}
