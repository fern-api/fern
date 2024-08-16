using System;
using SeedApi.Core;

#nullable enable

namespace SeedApi;

public partial class SeedApiClient
{
    private RawClient _client;

    public SeedApiClient(ClientOptions? clientOptions = null)
    {
        _client = new RawClient(
            new Dictionary<string, string>() { { "X-Fern-Language", "C#" }, },
            new Dictionary<string, Func<string>>(),
            clientOptions ?? new ClientOptions()
        );
        User = new UserClient(_client);
    }

    public UserClient User { get; init; }
}
