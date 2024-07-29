using System;
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
            new Dictionary<string, Func<string>>() { },
            clientOptions ?? new ClientOptions()
        );
        InlinedRequest = new InlinedRequestClient(_client);
        PathParam = new PathParamClient(_client);
        QueryParam = new QueryParamClient(_client);
    }

    public InlinedRequestClient InlinedRequest { get; init; }

    public PathParamClient PathParam { get; init; }

    public QueryParamClient QueryParam { get; init; }
}
