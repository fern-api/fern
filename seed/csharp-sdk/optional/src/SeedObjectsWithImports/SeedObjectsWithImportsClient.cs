using System;
using SeedObjectsWithImports.Core;

#nullable enable

namespace SeedObjectsWithImports;

internal partial class SeedObjectsWithImportsClient
{
    public SeedObjectsWithImportsClient(ClientOptions? clientOptions = null)
    {
        _client = new RawClient(
            new Dictionary<string, string>() { { "X-Fern-Language", "C#" }, },
            new Dictionary<string, Func<string>>() { },
            clientOptions ?? new ClientOptions()
        );
        Optional = new OptionalClient(_client);
    }

    public RawClient _client;

    public OptionalClient Optional { get; init; }
}
