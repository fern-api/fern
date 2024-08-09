using System;
using SeedUndiscriminatedUnions.Core;

#nullable enable

namespace SeedUndiscriminatedUnions;

internal partial class SeedUndiscriminatedUnionsClient
{
    public SeedUndiscriminatedUnionsClient(ClientOptions? clientOptions = null)
    {
        _client = new RawClient(
            new Dictionary<string, string>() { { "X-Fern-Language", "C#" }, },
            new Dictionary<string, Func<string>>() { },
            clientOptions ?? new ClientOptions()
        );
        Union = new UnionClient(_client);
    }

    public RawClient _client;

    public UnionClient Union { get; init; }
}
