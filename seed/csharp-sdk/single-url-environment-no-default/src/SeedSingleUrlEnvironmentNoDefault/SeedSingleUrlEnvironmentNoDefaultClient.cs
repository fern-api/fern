using System;
using SeedSingleUrlEnvironmentNoDefault.Core;

#nullable enable

namespace SeedSingleUrlEnvironmentNoDefault;

internal partial class SeedSingleUrlEnvironmentNoDefaultClient
{
    public SeedSingleUrlEnvironmentNoDefaultClient(
        string? token = null,
        ClientOptions? clientOptions = null
    )
    {
        _client = new RawClient(
            new Dictionary<string, string>()
            {
                { "Authorization", $"Bearer {token}" },
                { "X-Fern-Language", "C#" },
            },
            new Dictionary<string, Func<string>>() { },
            clientOptions ?? new ClientOptions()
        );
        Dummy = new DummyClient(_client);
    }

    public RawClient _client;

    public DummyClient Dummy { get; init; }
}
