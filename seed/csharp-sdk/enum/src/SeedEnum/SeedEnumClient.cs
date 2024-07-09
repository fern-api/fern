using SeedEnum;
using SeedEnum.Core;

#nullable enable

namespace SeedEnum;

public partial class SeedEnumClient
{
    private RawClient _client;

    public SeedEnumClient(ClientOptions? clientOptions = null)
    {
        _client = new RawClient(
            new Dictionary<string, string>() { { "X-Fern-Language", "C#" }, },
            clientOptions ?? new ClientOptions()
        );
        InlinedRequest = new InlinedRequestClient(_client);
        PathParam = new PathParamClient(_client);
        QueryParam = new QueryParamClient(_client);
    }

    public InlinedRequestClient InlinedRequest { get; }

    public PathParamClient PathParam { get; }

    public QueryParamClient QueryParam { get; }
}
