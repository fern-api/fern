using SeedOauthClientCredentialsDefault;
using SeedOauthClientCredentialsDefault.Core;

#nullable enable

namespace SeedOauthClientCredentialsDefault;

public partial class SeedOauthClientCredentialsDefaultClient
{
    private RawClient _client;

    public SeedOauthClientCredentialsDefaultClient(
        string token,
        ClientOptions? clientOptions = null
    )
    {
        _client = new RawClient(
            new Dictionary<string, string>() { { "X-Fern-Language", "C#" }, },
            clientOptions ?? new ClientOptions()
        );
        Auth = new AuthClient(_client);
    }

    public AuthClient Auth { get; }
}
