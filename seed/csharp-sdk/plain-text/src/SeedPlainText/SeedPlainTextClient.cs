using System;
using SeedPlainText;
using SeedPlainText.Core;

#nullable enable

namespace SeedPlainText;

public partial class SeedPlainTextClient
{
    private RawClient _client;

    public SeedPlainTextClient(ClientOptions? clientOptions = null)
    {
        _client = new RawClient(
            new Dictionary<string, string>() { { "X-Fern-Language", "C#" }, },
            new Dictionary<string, Func<string>>() { },
            clientOptions ?? new ClientOptions()
        );
        Service = new ServiceClient(_client);
    }

    public ServiceClient Service { get; init; }
}
