using SeedOauthClientCredentials.Core;

namespace SeedOauthClientCredentials;

public partial class SeedOauthClientCredentialsClient
{
    private readonly RawClient _client;

    public SeedOauthClientCredentialsClient(
        string clientId,
        string clientSecret,
        ClientOptions? clientOptions = null
    )
    {
        var defaultHeaders = new Headers(
            new Dictionary<string, string>()
            {
                { "X-Fern-Language", "C#" },
                { "X-Fern-SDK-Name", "SeedOauthClientCredentials" },
                { "X-Fern-SDK-Version", Version.Current },
                { "User-Agent", "Fernoauth-client-credentials/0.0.1" },
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
        var tokenProvider = new OAuthTokenProvider(
            clientId,
            clientSecret,
            new AuthClient(new RawClient(clientOptions.Clone()))
        );
        clientOptions.Headers["Authorization"] = new Func<string>(
            () => tokenProvider.GetAccessTokenAsync().Result
        );
        _client = new RawClient(clientOptions);
        Auth = new AuthClient(_client);
    }

    public AuthClient Auth { get; init; }
}
