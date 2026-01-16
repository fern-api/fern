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
            clientOptions.ExceptionHandler = new ExceptionHandler(
                new SeedOauthClientCredentialsExceptionInterceptor(clientOptions)
            );
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
            NestedNoAuth = new NestedNoAuthClient(_client);
            Nested = new NestedClient(_client);
            Simple = new SimpleClient(_client);
            Raw = new RawAccessClient(_client);
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

    public SeedOauthClientCredentialsClient.RawAccessClient Raw { get; }

    public partial class RawAccessClient
    {
        private readonly RawClient _client;

        internal RawAccessClient(RawClient client)
        {
            _client = client;
        }

        private static IReadOnlyDictionary<string, IEnumerable<string>> ExtractHeaders(
            HttpResponseMessage response
        )
        {
            var headers = new Dictionary<string, IEnumerable<string>>(
                StringComparer.OrdinalIgnoreCase
            );
            foreach (var header in response.Headers)
            {
                headers[header.Key] = header.Value.ToList();
            }
            if (response.Content != null)
            {
                foreach (var header in response.Content.Headers)
                {
                    headers[header.Key] = header.Value.ToList();
                }
            }
            return headers;
        }
    }
}
