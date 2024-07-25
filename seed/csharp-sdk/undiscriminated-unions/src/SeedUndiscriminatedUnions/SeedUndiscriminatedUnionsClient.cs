using System;
using SeedUndiscriminatedUnions;
using SeedUndiscriminatedUnions.Core;

#nullable enable

namespace SeedUndiscriminatedUnions;

public partial class SeedUndiscriminatedUnionsClient
{
    private RawClient _client;

    public SeedUndiscriminatedUnionsClient(ClientOptions? clientOptions = null)
    {
        _client = new RawClient(
            new Dictionary<string, string>() { { "X-Fern-Language", "C#" }, },
            new Dictionary<string, Func<string>>() { },
            clientOptions ?? new ClientOptions()
        );
        Union = new UnionClient(_client);
    }

    public UnionClient Union { get; init; }
}
