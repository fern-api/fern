using System;
using SeedCustomAuth;
using SeedCustomAuth.Core;

#nullable enable

namespace SeedCustomAuth;

public partial class SeedCustomAuthClient
{
    private RawClient _client;

    public SeedCustomAuthClient(
        string? customAuthScheme = null,
        ClientOptions? clientOptions = null
    )
    {
        _client = new RawClient(
            new Dictionary<string, string>()
            {
                { "X-API-KEY", customAuthScheme },
                { "X-Fern-Language", "C#" },
            },
            new Dictionary<string, Func<string>>() { },
            clientOptions ?? new ClientOptions()
        );
        CustomAuth = new CustomAuthClient(_client);
        Errors = new ErrorsClient(_client);
    }

    public CustomAuthClient CustomAuth { get; init; }

    public ErrorsClient Errors { get; init; }
}
