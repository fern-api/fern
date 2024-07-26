using System;
using SeedStreaming;
using SeedStreaming.Core;

#nullable enable

namespace SeedStreaming;

public partial class SeedStreamingClient
{
    private RawClient _client;

    public SeedStreamingClient(ClientOptions? clientOptions = null)
    {
        _client = new RawClient(
            new Dictionary<string, string>() { { "X-Fern-Language", "C#" }, },
            new Dictionary<string, Func<string>>() { },
            clientOptions ?? new ClientOptions()
        );
        Dummy = new DummyClient(_client);
    }

    public DummyClient Dummy { get; init; }
}
