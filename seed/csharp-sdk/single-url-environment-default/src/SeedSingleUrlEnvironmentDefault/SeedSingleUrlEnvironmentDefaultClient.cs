using System;
using SeedSingleUrlEnvironmentDefault;
using SeedSingleUrlEnvironmentDefault.Core;

#nullable enable

namespace SeedSingleUrlEnvironmentDefault;

public partial class SeedSingleUrlEnvironmentDefaultClient
{
    private RawClient _client;

    public SeedSingleUrlEnvironmentDefaultClient(
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

    public DummyClient Dummy { get; init; }
}
