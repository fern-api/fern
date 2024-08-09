using System;
using SeedBasicAuth.Core;

#nullable enable

namespace SeedBasicAuth;

internal partial class SeedBasicAuthClient
{
    public SeedBasicAuthClient(
        string? username = null,
        string? password = null,
        ClientOptions? clientOptions = null
    )
    {
        _client = new RawClient(
            new Dictionary<string, string>() { { "X-Fern-Language", "C#" }, },
            new Dictionary<string, Func<string>>() { },
            clientOptions ?? new ClientOptions()
        );
        BasicAuth = new BasicAuthClient(_client);
        Errors = new ErrorsClient(_client);
    }

    public RawClient _client;

    public BasicAuthClient BasicAuth { get; init; }

    public ErrorsClient Errors { get; init; }
}
