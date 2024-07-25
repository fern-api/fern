using System;
using SeedObject.Core;

#nullable enable

namespace SeedObject;

public partial class SeedObjectClient
{
    private RawClient _client;

    public SeedObjectClient(ClientOptions? clientOptions = null)
    {
        _client = new RawClient(
            new Dictionary<string, string>() { { "X-Fern-Language", "C#" }, },
            new Dictionary<string, Func<string>>() { },
            clientOptions ?? new ClientOptions()
        );
    }
}
