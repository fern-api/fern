using System;
using SeedApi.Core;

#nullable enable

namespace SeedApi;

internal partial class SeedApiClient
{
    public SeedApiClient(ClientOptions? clientOptions = null)
    {
        _client = new RawClient(
            new Dictionary<string, string>() { { "X-Fern-Language", "C#" }, },
            new Dictionary<string, Func<string>>() { },
            clientOptions ?? new ClientOptions()
        );
        A = new AClient(_client);
        Ast = new AstClient(_client);
    }

    public RawClient _client;

    public AClient A { get; init; }

    public AstClient Ast { get; init; }
}
