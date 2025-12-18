using SeedOauthClientCredentialsReference.Core;

namespace SeedOauthClientCredentialsReference;

public partial class SeedOauthClientCredentialsReferenceClient
{
    private readonly RawClient _client;

    public SeedOauthClientCredentialsReferenceClient(
        string clientId,
        string clientSecret,
        ClientOptions? clientOptions = null
    )
    {
        var defaultHeaders = new Headers(
            new Dictionary<string, string>()
            {
                { "X-Fern-Language", "C#" },
                { "X-Fern-SDK-Name", "SeedOauthClientCredentialsReference" },
                { "X-Fern-SDK-Version", Version.Current },
                { "User-Agent", "Fernoauth-client-credentials-reference/0.0.1" },
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
        clientOptions.Headers["Authorization"] =
            new Func<global::System.Threading.Tasks.ValueTask<string>>(async () =>
                await tokenProvider.GetAccessTokenAsync().ConfigureAwait(false)
            );
        _client = new RawClient(clientOptions);
        Auth = new AuthClient(_client);
        Simple = new SimpleClient(_client);
    }

    public AuthClient Auth { get; }

    public SimpleClient Simple { get; }
}
