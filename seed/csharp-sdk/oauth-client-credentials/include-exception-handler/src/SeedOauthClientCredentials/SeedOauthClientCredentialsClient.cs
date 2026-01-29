using SeedOauthClientCredentials.Core;
using SeedOauthClientCredentials.Nested;
using SeedOauthClientCredentials.NestedNoAuth;

namespace SeedOauthClientCredentials;

public partial class SeedOauthClientCredentialsClient : ISeedOauthClientCredentialsClient
{
    private readonly RawClient _client;

    public SeedOauthClientCredentialsClient(
        string clientId,
        string clientSecret,
        ClientOptions? clientOptions = null
    )
    {
        try
        {
            clientOptions ??= new ClientOptions();
            clientOptions.ExceptionHandler = new ExceptionHandler(
                new SeedOauthClientCredentialsExceptionInterceptor(clientOptions)
            );
            var platformHeaders = new Headers(
                new Dictionary<string, string>()
                {
                    { "X-Fern-Language", "C#" },
                    { "X-Fern-SDK-Name", "SeedOauthClientCredentials" },
                    { "X-Fern-SDK-Version", Version.Current },
                    { "User-Agent", "Fernoauth-client-credentials/0.0.1" },
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
            NestedNoAuth = new NestedNoAuthClient(_client);
            Nested = new NestedClient(_client);
            Simple = new SimpleClient(_client);
        }
        catch (Exception ex)
        {
            var interceptor = new SeedOauthClientCredentialsExceptionInterceptor(clientOptions);
            interceptor.Intercept(ex);
            throw;
        }
    }

    public AuthClient Auth { get; }

    public NestedNoAuthClient NestedNoAuth { get; }

    public NestedClient Nested { get; }

    public SimpleClient Simple { get; }
}
