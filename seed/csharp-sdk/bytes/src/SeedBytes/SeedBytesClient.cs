using System;
using SeedBytes;
using SeedBytes.Core;

#nullable enable

namespace SeedBytes;

public partial class SeedBytesClient
{
    private RawClient _client;

    public SeedBytesClient(ClientOptions? clientOptions = null)
    {
        _client = new RawClient(
            new Dictionary<string, string>() { { "X-Fern-Language", "C#" }, },
            new Dictionary<string, Func<string>>() { },
            clientOptions ?? new ClientOptions()
        );
        Service = new ServiceClient(_client);
    }

    public ServiceClient Service { get; init; }
}
