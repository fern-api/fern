using System;
using SeedUnknownAsAny;
using SeedUnknownAsAny.Core;

#nullable enable

namespace SeedUnknownAsAny;

public partial class SeedUnknownAsAnyClient
{
    private RawClient _client;

    public SeedUnknownAsAnyClient(ClientOptions? clientOptions = null)
    {
        _client = new RawClient(
            new Dictionary<string, string>() { { "X-Fern-Language", "C#" }, },
            new Dictionary<string, Func<string>>() { },
            clientOptions ?? new ClientOptions()
        );
        Unknown = new UnknownClient(_client);
    }

    public UnknownClient Unknown { get; init; }
}
