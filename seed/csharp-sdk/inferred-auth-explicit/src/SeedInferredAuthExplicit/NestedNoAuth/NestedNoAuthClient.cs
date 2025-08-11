using SeedInferredAuthExplicit.Core;

namespace SeedInferredAuthExplicit.NestedNoAuth;

public partial class NestedNoAuthClient
{
    private RawClient _client;

    internal NestedNoAuthClient(RawClient client)
    {
        _client = client;
        Api = new ApiClient(_client);
    }

    public ApiClient Api { get; }
}
