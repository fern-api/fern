using System;
using SeedResponseProperty.Core;

#nullable enable

namespace SeedResponseProperty;

internal partial class SeedResponsePropertyClient
{
    public SeedResponsePropertyClient(ClientOptions? clientOptions = null)
    {
        _client = new RawClient(
            new Dictionary<string, string>() { { "X-Fern-Language", "C#" }, },
            new Dictionary<string, Func<string>>() { },
            clientOptions ?? new ClientOptions()
        );
        Service = new ServiceClient(_client);
    }

    public RawClient _client;

    public ServiceClient Service { get; init; }
}
