using System;
using SeedVersion;
using SeedVersion.Core;

#nullable enable

namespace SeedVersion;

public partial class SeedVersionClient
{
    private RawClient _client;

    public SeedVersionClient(ClientOptions? clientOptions = null)
    {
        _client = new RawClient(
            new Dictionary<string, string>() { { "X-Fern-Language", "C#" }, },
            new Dictionary<string, Func<string>>() { },
            clientOptions ?? new ClientOptions()
        );
        User = new UserClient(_client);
    }

    public UserClient User { get; init; }
}
