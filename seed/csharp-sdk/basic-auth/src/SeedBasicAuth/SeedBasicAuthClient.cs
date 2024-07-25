using System;
using SeedBasicAuth;
using SeedBasicAuth.Core;

#nullable enable

namespace SeedBasicAuth;

public partial class SeedBasicAuthClient
{
    private RawClient _client;

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

    public BasicAuthClient BasicAuth { get; init; }

    public ErrorsClient Errors { get; init; }
}
