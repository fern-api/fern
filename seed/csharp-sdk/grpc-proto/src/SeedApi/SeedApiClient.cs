using System;
using SeedApi.Core;

#nullable enable

namespace SeedApi;

internal partial class SeedApiClient
{
    public SeedApiClient(ClientOptions? clientOptions = null)
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
