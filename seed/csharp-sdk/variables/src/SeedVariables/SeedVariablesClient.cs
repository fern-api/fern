using System;
using SeedVariables;
using SeedVariables.Core;

#nullable enable

namespace SeedVariables;

public partial class SeedVariablesClient
{
    private RawClient _client;

    public SeedVariablesClient(ClientOptions? clientOptions = null)
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
