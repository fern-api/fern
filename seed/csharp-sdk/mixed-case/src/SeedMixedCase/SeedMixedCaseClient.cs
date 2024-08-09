using System;
using SeedMixedCase.Core;

#nullable enable

namespace SeedMixedCase;

internal partial class SeedMixedCaseClient
{
    public SeedMixedCaseClient(ClientOptions? clientOptions = null)
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
