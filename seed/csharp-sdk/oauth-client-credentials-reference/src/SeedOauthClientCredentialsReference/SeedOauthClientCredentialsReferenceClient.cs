using SeedOauthClientCredentialsReference.Core;

namespace SeedOauthClientCredentialsReference;

public partial class SeedOauthClientCredentialsReferenceClient
    : ISeedOauthClientCredentialsReferenceClient
{
    private readonly RawClient _client;

    public SeedOauthClientCredentialsReferenceClient(
        string? clientId = null,
        string? clientSecret = null,
        string? token = null,
        ClientOptions? clientOptions = null
    )
    {
        clientOptions ??= new ClientOptions();
        var platformHeaders = new Headers(
            new Dictionary<string, string>()
            {
                { "X-Fern-Language", "C#" },
                { "X-Fern-SDK-Name", "SeedOauthClientCredentialsReference" },
                { "X-Fern-SDK-Version", Version.Current },
                { "User-Agent", "Fernoauth-client-credentials-reference/0.0.1" },
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
        if (token != null)
        {
            clientOptionsWithAuth.Headers["Authorization"] = $"Bearer {token}";
        }
        else
        {
            if (clientId == null || clientSecret == null)
            {
                throw new ArgumentException(
                    "Please provide either a 'token' or both 'clientId' and 'clientSecret'."
                );
            }
            var tokenProvider = new OAuthTokenProvider(
                clientId,
                clientSecret,
                new AuthClient(new RawClient(clientOptions))
            );
            clientOptionsWithAuth.Headers["Authorization"] =
                new Func<global::System.Threading.Tasks.ValueTask<string>>(async () =>
                    await tokenProvider.GetAccessTokenAsync().ConfigureAwait(false)
                );
        }
        _client = new RawClient(clientOptionsWithAuth);
        Auth = new AuthClient(_client);
        Simple = new SimpleClient(_client);
    }

    public IAuthClient Auth { get; }

    public ISimpleClient Simple { get; }
}
