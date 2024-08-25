using SeedOauthClientCredentialsDefault.Core;

#nullable enable

namespace SeedOauthClientCredentialsDefault;

public partial class SeedOauthClientCredentialsDefaultClient
{
    private RawClient _client;

    public SeedOauthClientCredentialsDefaultClient(ClientOptions? clientOptions = null)
    {
        var defaultHeaders = new Headers(
            new Dictionary<string, string>()
            {
                { "X-Fern-Language", "C#" },
                { "User-Agent", "Fernoauth-client-credentials-default/0.0.1" },
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
