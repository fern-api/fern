using System;
using SeedObjectsWithImports;
using SeedObjectsWithImports.Commons;
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
        Commons = new CommonsClient(_client);
        File = new FileClient(_client);
    }

    public CommonsClient Commons { get; init; }

    public FileClient File { get; init; }
}
