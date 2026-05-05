using SeedOauthClientCredentialsWithVariables.Core;
using SeedOauthClientCredentialsWithVariables.Nested;
using SeedOauthClientCredentialsWithVariables.NestedNoAuth;

namespace SeedOauthClientCredentialsWithVariables;

public partial class SeedOauthClientCredentialsWithVariablesClient
    : ISeedOauthClientCredentialsWithVariablesClient
{
    private readonly RawClient _client;

    public SeedOauthClientCredentialsWithVariablesClient(
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
                { "X-Fern-SDK-Name", "SeedOauthClientCredentialsWithVariables" },
                { "X-Fern-SDK-Version", Version.Current },
                { "User-Agent", "Fernoauth-client-credentials-with-variables/0.0.1" },
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
        NestedNoAuth = new NestedNoAuthClient(_client);
        Nested = new NestedClient(_client);
        Service = new ServiceClient(_client);
        Simple = new SimpleClient(_client);
    }

    public IAuthClient Auth { get; }

    public INestedNoAuthClient NestedNoAuth { get; }

    public INestedClient Nested { get; }

    public IServiceClient Service { get; }

    public ISimpleClient Simple { get; }
}
