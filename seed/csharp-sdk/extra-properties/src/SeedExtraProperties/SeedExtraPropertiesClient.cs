using System;
using SeedExtraProperties;
using SeedExtraProperties.Core;

#nullable enable

namespace SeedExtraProperties;

public partial class SeedExtraPropertiesClient
{
    private RawClient _client;

    public SeedExtraPropertiesClient(ClientOptions? clientOptions = null)
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
