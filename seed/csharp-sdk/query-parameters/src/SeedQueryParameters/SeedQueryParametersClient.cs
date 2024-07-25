using System;
using SeedQueryParameters;
using SeedQueryParameters.Core;

#nullable enable

namespace SeedQueryParameters;

public partial class SeedQueryParametersClient
{
    private RawClient _client;

    public SeedQueryParametersClient(ClientOptions? clientOptions = null)
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
