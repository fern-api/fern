using System;
using SeedNurseryApi;
using SeedNurseryApi.Core;

#nullable enable

namespace SeedNurseryApi;

public partial class SeedNurseryApiClient
{
    private RawClient _client;

    public SeedNurseryApiClient(ClientOptions? clientOptions = null)
    {
        _client = new RawClient(
            new Dictionary<string, string>() { { "X-Fern-Language", "C#" }, },
            new Dictionary<string, Func<string>>() { },
            clientOptions ?? new ClientOptions()
        );
        Package = new PackageClient(_client);
    }

    public PackageClient Package { get; init; }
}
