using System;
using SeedExtraProperties.Core;

#nullable enable

namespace SeedExtraProperties;

internal partial class SeedExtraPropertiesClient
{
    public SeedExtraPropertiesClient(ClientOptions? clientOptions = null)
    {
        _client = new RawClient(
            new Dictionary<string, string>() { { "X-Fern-Language", "C#" }, },
            new Dictionary<string, Func<string>>() { },
            clientOptions ?? new ClientOptions()
        );
        User = new UserClient(_client);
    }

    public RawClient _client;

    public UserClient User { get; init; }
}
