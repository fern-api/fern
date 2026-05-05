using SeedOauthClientCredentialsMandatoryAuth.Core;
using SeedOauthClientCredentialsMandatoryAuth.Nested;

namespace SeedOauthClientCredentialsMandatoryAuth;

public partial class SeedOauthClientCredentialsMandatoryAuthClient
    : ISeedOauthClientCredentialsMandatoryAuthClient
{
    private readonly RawClient _client;

    public SeedOauthClientCredentialsMandatoryAuthClient(ClientOptions clientOptions)
    {
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
        if (clientOptions.Token != null)
        {
            clientOptionsWithAuth.Headers["Authorization"] = $"Bearer {clientOptions.Token}";
        }
        else
        {
            if (clientOptions.ClientId == null || clientOptions.ClientSecret == null)
            {
                throw new ArgumentException(
                    "Please provide either a 'token' or both 'clientId' and 'clientSecret'."
                );
            }
            var tokenProvider = new OAuthTokenProvider(
                clientOptions.ClientId!,
                clientOptions.ClientSecret!,
                new AuthClient(new RawClient(clientOptions))
            );
            clientOptionsWithAuth.Headers["Authorization"] =
                new Func<global::System.Threading.Tasks.ValueTask<string>>(async () =>
                    await tokenProvider.GetAccessTokenAsync().ConfigureAwait(false)
                );
        }
        _client = new RawClient(clientOptionsWithAuth);
        Auth = new AuthClient(_client);
        Nested = new NestedClient(_client);
        Simple = new SimpleClient(_client);
    }

    public IAuthClient Auth { get; }

    public INestedClient Nested { get; }

    public ISimpleClient Simple { get; }
}
