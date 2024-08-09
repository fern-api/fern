using System;
using SeedStreaming.Core;

#nullable enable

namespace SeedStreaming;

internal partial class SeedStreamingClient
{
    public SeedStreamingClient(ClientOptions? clientOptions = null)
    {
        _client = new RawClient(
            new Dictionary<string, string>() { { "X-Fern-Language", "C#" }, },
            new Dictionary<string, Func<string>>() { },
            clientOptions ?? new ClientOptions()
        );
        Dummy = new DummyClient(_client);
    }

    public RawClient _client;

    public DummyClient Dummy { get; init; }
}
