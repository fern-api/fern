using System;
using SeedObjectsWithImports.Commons;
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
        Commons = new CommonsClient(_client);
        File = new FileClient(_client);
    }

    public RawClient _client;

    public CommonsClient Commons { get; init; }

    public FileClient File { get; init; }
}
