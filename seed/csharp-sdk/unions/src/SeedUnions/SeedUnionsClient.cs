using System;
using SeedUnions.Core;

#nullable enable

namespace SeedUnions;

internal partial class SeedUnionsClient
{
    public SeedUnionsClient(ClientOptions? clientOptions = null)
    {
        _client = new RawClient(
            new Dictionary<string, string>() { { "X-Fern-Language", "C#" }, },
            new Dictionary<string, Func<string>>() { },
            clientOptions ?? new ClientOptions()
        );
        Types = new TypesClient(_client);
        Union = new UnionClient(_client);
    }

    public RawClient _client;

    public TypesClient Types { get; init; }

    public UnionClient Union { get; init; }
}
