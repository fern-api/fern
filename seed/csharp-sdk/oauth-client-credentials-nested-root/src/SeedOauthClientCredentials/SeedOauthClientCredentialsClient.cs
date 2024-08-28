using SeedOauthClientCredentials.Auth;
using SeedOauthClientCredentials.Core;

#nullable enable

namespace SeedOauthClientCredentials;

public partial class SeedOauthClientCredentialsClient
{
    private RawClient _client;

    public SeedOauthClientCredentialsClient(ClientOptions? clientOptions = null)
    {
        var defaultHeaders = new Headers(
            new Dictionary<string, string>()
            {
                { "X-Fern-Language", "C#" },
                { "X-Fern-SDK-Name", "SeedOauthClientCredentials" },
                { "X-Fern-SDK-Version", Version.Current },
                { "User-Agent", "Fernoauth-client-credentials-nested-root/0.0.1" },
            }
        );
        clientOptions ??= new ClientOptions();
        foreach (var header in defaultHeaders)
        {
            if (!clientOptions.Headers.ContainsKey(header.Key))
            {
                clientOptions.Headers[header.Key] = header.Value;
            }
        }
        _client = new RawClient(clientOptions);
        Auth = new AuthClient(_client);
    }

    public AuthClient Auth { get; init; }
}
