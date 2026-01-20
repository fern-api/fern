using SeedOauthClientCredentialsMandatoryAuth.Core;

namespace SeedOauthClientCredentialsMandatoryAuth.Nested;

public partial class NestedClient : INestedClient
{
    private RawClient _client;

    internal NestedClient(RawClient client)
    {
        _client = client;
        Api = new ApiClient(_client);
        Raw = new WithRawResponseClient(_client);
    }

    public ApiClient Api { get; }

    public NestedClient.WithRawResponseClient Raw { get; }

    public partial class WithRawResponseClient
    {
        private readonly RawClient _client;

        internal WithRawResponseClient(RawClient client)
        {
            _client = client;
        }
    }
}
