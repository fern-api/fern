using System;
using SeedCsharpNamespaceConflict.A;
using SeedCsharpNamespaceConflict.B;
using SeedCsharpNamespaceConflict.Core;

#nullable enable

namespace SeedCsharpNamespaceConflict;

internal partial class SeedCsharpNamespaceConflictClient
{
    public SeedCsharpNamespaceConflictClient(ClientOptions? clientOptions = null)
    {
        _client = new RawClient(
            new Dictionary<string, string>() { { "X-Fern-Language", "C#" }, },
            new Dictionary<string, Func<string>>() { },
            clientOptions ?? new ClientOptions()
        );
        A = new AClient(_client);
        B = new BClient(_client);
        Tasktest = new TasktestClient(_client);
    }

    public RawClient _client;

    public AClient A { get; init; }

    public BClient B { get; init; }

    public TasktestClient Tasktest { get; init; }
}
