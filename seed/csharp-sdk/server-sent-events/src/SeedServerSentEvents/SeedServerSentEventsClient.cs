using System;
using SeedServerSentEvents;
using SeedServerSentEvents.Core;

#nullable enable

namespace SeedServerSentEvents;

public partial class SeedServerSentEventsClient
{
    private RawClient _client;

    public SeedServerSentEventsClient(ClientOptions? clientOptions = null)
    {
        _client = new RawClient(
            new Dictionary<string, string>() { { "X-Fern-Language", "C#" }, },
            new Dictionary<string, Func<string>>() { },
            clientOptions ?? new ClientOptions()
        );
        Completions = new CompletionsClient(_client);
    }

    public CompletionsClient Completions { get; init; }
}
