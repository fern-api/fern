using System;
using SeedUnknownAsAny.Core;

#nullable enable

namespace SeedUnknownAsAny;

internal partial class SeedUnknownAsAnyClient
{
    public SeedUnknownAsAnyClient(ClientOptions? clientOptions = null)
    {
        _client = new RawClient(
            new Dictionary<string, string>() { { "X-Fern-Language", "C#" }, },
            new Dictionary<string, Func<string>>() { },
            clientOptions ?? new ClientOptions()
        );
        Unknown = new UnknownClient(_client);
    }

    public RawClient _client;

    public UnknownClient Unknown { get; init; }
}
