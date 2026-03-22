using SeedWebsocketOauth.Core;

namespace SeedWebsocketOauth;

public partial class SeedWebsocketOauthClient : ISeedWebsocketOauthClient
{
    private readonly RawClient _client;

    private readonly WebSocketDefaults _wsDefaults;

    public SeedWebsocketOauthClient(
        string clientId,
        string clientSecret,
        string tenantName,
        ClientOptions? clientOptions = null
    )
    {
        clientOptions ??= new ClientOptions();
        var platformHeaders = new Headers(
            new Dictionary<string, string>()
            {
                { "X-Fern-Language", "C#" },
                { "X-Fern-SDK-Name", "SeedWebsocketOauth" },
                { "X-Fern-SDK-Version", Version.Current },
                { "User-Agent", "Fernwebsocket-oauth/0.0.1" },
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
        var authHeaders = new Headers(
            new Dictionary<string, string>() { { "Tenant-Name", tenantName } }
        );
        foreach (var header in authHeaders)
        {
            clientOptionsWithAuth.Headers[header.Key] = header.Value;
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
        _wsDefaults = new WebSocketDefaults
        {
            TenantName = tenantName,
            GetToken = () =>
            {
                var bearerToken = tokenProvider.GetAccessTokenAsync().Result;
                const string bearerPrefix = "Bearer ";
                return bearerToken.StartsWith(bearerPrefix)
                    ? bearerToken.Substring(bearerPrefix.Length)
                    : bearerToken;
            },
        };
        _client = new RawClient(clientOptionsWithAuth);
        Auth = new AuthClient(_client);
    }

    public IAuthClient Auth { get; }

    public ITranscribeApi CreateTranscribeApi()
    {
        var defaults = new TranscribeApi.Options
        {
            TenantName = _wsDefaults.TenantName,
            Token = _wsDefaults.GetToken?.Invoke(),
        };
        var options = TranscribeApi.Options.WithDefaults(null, defaults);
        return new TranscribeApi(options);
    }

    public ITranscribeApi CreateTranscribeApi(TranscribeApi.Options options)
    {
        var defaults = new TranscribeApi.Options
        {
            TenantName = _wsDefaults.TenantName,
            Token = _wsDefaults.GetToken?.Invoke(),
        };
        var resolvedOptions = TranscribeApi.Options.WithDefaults(options, defaults);
        return new TranscribeApi(resolvedOptions);
    }
}
