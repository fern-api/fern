using System;
using SeedCodeSamples;
using SeedCodeSamples.Core;

#nullable enable

namespace SeedCodeSamples;

public partial class SeedCodeSamplesClient
{
    private RawClient _client;

    public SeedCodeSamplesClient(ClientOptions? clientOptions = null)
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
