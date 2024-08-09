using System;
using SeedMultiLineDocs.Core;

#nullable enable

namespace SeedMultiLineDocs;

internal partial class SeedMultiLineDocsClient
{
    public SeedMultiLineDocsClient(ClientOptions? clientOptions = null)
    {
        _client = new RawClient(
            new Dictionary<string, string>() { { "X-Fern-Language", "C#" }, },
            new Dictionary<string, Func<string>>() { },
            clientOptions ?? new ClientOptions()
        );
        User = new UserClient(_client);
    }

    public RawClient _client;

    public UserClient User { get; init; }
}
