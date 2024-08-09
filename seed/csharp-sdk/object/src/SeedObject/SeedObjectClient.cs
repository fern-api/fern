using System;
using SeedObject.Core;

#nullable enable

namespace SeedObject;

internal partial class SeedObjectClient
{
    public SeedObjectClient(ClientOptions? clientOptions = null)
    {
        _client = new RawClient(
            new Dictionary<string, string>() { { "X-Fern-Language", "C#" }, },
            new Dictionary<string, Func<string>>() { },
            clientOptions ?? new ClientOptions()
        );
    }

    public RawClient _client;
}
