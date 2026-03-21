using SeedWebsocketOauth.Core;

namespace SeedWebsocketOauth;

public partial class SeedWebsocketOauthClient : ISeedWebsocketOauthClient
{
    private readonly RawClient _client;

    private readonly string _tenantName;

    private readonly OAuthTokenProvider _tokenProvider;

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
        _tenantName = tenantName;
        var clientOptionsWithAuth = clientOptions.Clone();
        var authHeaders = new Headers(
            new Dictionary<string, string>() { { "Tenant-Name", tenantName } }
        );
        foreach (var header in authHeaders)
        {
            clientOptionsWithAuth.Headers[header.Key] = header.Value;
        }
        _tokenProvider = new OAuthTokenProvider(
            clientId,
            clientSecret,
            new AuthClient(new RawClient(clientOptions))
        );
        clientOptionsWithAuth.Headers["Authorization"] =
            new Func<global::System.Threading.Tasks.ValueTask<string>>(async () =>
                await _tokenProvider.GetAccessTokenAsync().ConfigureAwait(false)
            );
        _client = new RawClient(clientOptionsWithAuth);
        Auth = new AuthClient(_client);
    }

    public IAuthClient Auth { get; }

    private string GetRawAccessToken()
    {
        var bearerToken = _tokenProvider.GetAccessTokenAsync().Result;
        const string bearerPrefix = "Bearer ";
        return bearerToken.StartsWith(bearerPrefix)
            ? bearerToken.Substring(bearerPrefix.Length)
            : bearerToken;
    }

    public ITranscribeApi CreateTranscribeApi()
    {
        var options = TranscribeApi.Options.WithDefaults(null, _tenantName, GetRawAccessToken());
        return new TranscribeApi(options);
    }

    public ITranscribeApi CreateTranscribeApi(TranscribeApi.Options options)
    {
        var resolvedOptions = TranscribeApi.Options.WithDefaults(
            options,
            _tenantName,
            GetRawAccessToken()
        );
        return new TranscribeApi(resolvedOptions);
    }
}
