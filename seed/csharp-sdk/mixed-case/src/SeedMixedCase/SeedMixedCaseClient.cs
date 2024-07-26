using System;
using SeedMixedCase;
using SeedMixedCase.Core;

#nullable enable

namespace SeedMixedCase;

public partial class SeedMixedCaseClient
{
    private RawClient _client;

    public SeedMixedCaseClient(ClientOptions? clientOptions = null)
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
