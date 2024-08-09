using System;
using SeedOauthClientCredentialsDefault.Core;

#nullable enable

namespace SeedOauthClientCredentialsDefault;

internal partial class SeedOauthClientCredentialsDefaultClient
{
    public SeedOauthClientCredentialsDefaultClient(ClientOptions? clientOptions = null)
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
