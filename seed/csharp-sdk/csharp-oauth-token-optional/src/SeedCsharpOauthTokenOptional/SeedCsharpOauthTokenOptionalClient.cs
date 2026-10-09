using SeedCsharpOauthTokenOptional.Core;

namespace SeedCsharpOauthTokenOptional;

public partial class SeedCsharpOauthTokenOptionalClient : ISeedCsharpOauthTokenOptionalClient
{
    private readonly RawClient _client;

    public SeedCsharpOauthTokenOptionalClient(
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
                { "X-Fern-SDK-Name", "SeedCsharpOauthTokenOptional" },
                { "X-Fern-SDK-Version", global::SeedCsharpOauthTokenOptional.Version.Current },
                { "User-Agent", "Ferncsharp-oauth-token-optional/0.0.1" },
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
    }

    public IAuthClient Auth { get; }
}
