using System;
using SeedObjectsWithImports;
using SeedObjectsWithImports.Core;

#nullable enable

namespace SeedObjectsWithImports;

public partial class SeedObjectsWithImportsClient
{
    private RawClient _client;

    public SeedObjectsWithImportsClient(ClientOptions? clientOptions = null)
    {
        _client = new RawClient(
            new Dictionary<string, string>() { { "X-Fern-Language", "C#" }, },
            new Dictionary<string, Func<string>>() { },
            clientOptions ?? new ClientOptions()
        );
        Optional = new OptionalClient(_client);
    }

    public OptionalClient Optional { get; init; }
}
