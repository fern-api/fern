using SeedInferredAuthImplicitApiKey.Core;

namespace SeedInferredAuthImplicitApiKey.NestedNoAuth;

public partial class NestedNoAuthClient : INestedNoAuthClient
{
    private readonly RawClient _client;

    internal NestedNoAuthClient(RawClient client)
    {
        _client = client;
        Api = new ApiClient(_client);
    }

    public IApiClient Api { get; }
}
