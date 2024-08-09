using System;
using SeedNoEnvironment.Core;

#nullable enable

namespace SeedNoEnvironment;

internal partial class SeedNoEnvironmentClient
{
    public SeedNoEnvironmentClient(string? token = null, ClientOptions? clientOptions = null)
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
