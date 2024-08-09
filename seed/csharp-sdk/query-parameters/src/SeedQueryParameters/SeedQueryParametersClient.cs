using System;
using SeedQueryParameters.Core;

#nullable enable

namespace SeedQueryParameters;

internal partial class SeedQueryParametersClient
{
    public SeedQueryParametersClient(ClientOptions? clientOptions = null)
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
