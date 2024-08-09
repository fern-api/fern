using System;
using SeedOauthClientCredentials.Auth;
using SeedOauthClientCredentials.Core;

#nullable enable

namespace SeedOauthClientCredentials;

internal partial class SeedOauthClientCredentialsClient
{
    public SeedOauthClientCredentialsClient(ClientOptions? clientOptions = null)
    {
        _client = new RawClient(
            new Dictionary<string, string>() { { "X-Fern-Language", "C#" }, },
            new Dictionary<string, Func<string>>() { },
            clientOptions ?? new ClientOptions()
        );
        Auth = new AuthClient(_client);
    }

    public RawClient _client;

    public AuthClient Auth { get; init; }
}
