using SeedOauthClientCredentials;
using SeedOauthClientCredentials.Core;

#nullable enable

namespace SeedOauthClientCredentials;

public partial class SeedOauthClientCredentialsClient
{
    private RawClient _client;

    public SeedOauthClientCredentialsClient(string token, ClientOptions? clientOptions = null)
    {
        _client = new RawClient(
            new Dictionary<string, string>() { { "X-Fern-Language", "C#" }, },
            clientOptions ?? new ClientOptions()
        );
        Auth = new AuthClient(_client);
    }

    public AuthClient Auth { get; }
}
