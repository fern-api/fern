using SeedOauthClientCredentialsMandatoryAuth.Core;
using SeedOauthClientCredentialsMandatoryAuth.Nested;

namespace SeedOauthClientCredentialsMandatoryAuth;

public partial class SeedOauthClientCredentialsMandatoryAuthClient
    : ISeedOauthClientCredentialsMandatoryAuthClient
{
    private readonly RawClient _client;

    public SeedOauthClientCredentialsMandatoryAuthClient(
        string clientId,
        string clientSecret,
        ClientOptions? clientOptions = null
    )
    {
        clientOptions ??= new ClientOptions();
        var platformHeaders = new Headers(
            new Dictionary<string, string>()
            {
                { "X-Fern-Language", "C#" },
                { "X-Fern-SDK-Name", "SeedOauthClientCredentialsMandatoryAuth" },
                { "X-Fern-SDK-Version", Version.Current },
                { "User-Agent", "Fernoauth-client-credentials-mandatory-auth/0.0.1" },
            }
        );
        foreach (var header in platformHeaders)
        {
            if (!clientOptions.Headers.ContainsKey(header.Key))
            {
                clientOptions.Headers[header.Key] = header.Value;
            }
        }
        var clientOptionsWithAuth = clientOptions.Clone();
        var tokenProvider = new OAuthTokenProvider(
            clientId,
            clientSecret,
            new AuthClient(new RawClient(clientOptions))
        );
        clientOptionsWithAuth.Headers["Authorization"] =
            new Func<global::System.Threading.Tasks.ValueTask<string>>(async () =>
                await tokenProvider.GetAccessTokenAsync().ConfigureAwait(false)
            );
        _client = new RawClient(clientOptionsWithAuth);
        Auth = new AuthClient(_client);
        Nested = new NestedClient(_client);
        Simple = new SimpleClient(_client);
    }

    public AuthClient Auth { get; }

    public NestedClient Nested { get; }

    public SimpleClient Simple { get; }
}
