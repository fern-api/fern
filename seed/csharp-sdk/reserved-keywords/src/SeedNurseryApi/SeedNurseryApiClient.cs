using System;
using SeedNurseryApi.Core;

#nullable enable

namespace SeedNurseryApi;

internal partial class SeedNurseryApiClient
{
    public SeedNurseryApiClient(ClientOptions? clientOptions = null)
    {
        _client = new RawClient(
            new Dictionary<string, string>() { { "X-Fern-Language", "C#" }, },
            new Dictionary<string, Func<string>>() { },
            clientOptions ?? new ClientOptions()
        );
        Package = new PackageClient(_client);
    }

    public RawClient _client;

    public PackageClient Package { get; init; }
}
