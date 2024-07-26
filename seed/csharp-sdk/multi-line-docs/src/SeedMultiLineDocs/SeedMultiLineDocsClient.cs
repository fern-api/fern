using System;
using SeedMultiLineDocs;
using SeedMultiLineDocs.Core;

#nullable enable

namespace SeedMultiLineDocs;

public partial class SeedMultiLineDocsClient
{
    private RawClient _client;

    public SeedMultiLineDocsClient(ClientOptions? clientOptions = null)
    {
        _client = new RawClient(
            new Dictionary<string, string>() { { "X-Fern-Language", "C#" }, },
            new Dictionary<string, Func<string>>() { },
            clientOptions ?? new ClientOptions()
        );
        User = new UserClient(_client);
    }

    public UserClient User { get; init; }
}
