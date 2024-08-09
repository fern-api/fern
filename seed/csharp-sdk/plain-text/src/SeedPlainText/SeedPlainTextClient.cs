using System;
using SeedPlainText.Core;

#nullable enable

namespace SeedPlainText;

internal partial class SeedPlainTextClient
{
    public SeedPlainTextClient(ClientOptions? clientOptions = null)
    {
        _client = new RawClient(
            new Dictionary<string, string>() { { "X-Fern-Language", "C#" }, },
            new Dictionary<string, Func<string>>() { },
            clientOptions ?? new ClientOptions()
        );
        Service = new ServiceClient(_client);
    }

    public RawClient _client;

    public ServiceClient Service { get; init; }
}
