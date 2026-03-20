using SeedWebsocketOauth.Core;

namespace SeedWebsocketOauth;

public partial class SeedWebsocketOauthClient : ISeedWebsocketOauthClient
{
    private readonly RawClient _client;

    private readonly SeedWebsocketOauth.Core.WebSocketDefaults _wsDefaults;

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
        _client = new RawClient(clientOptionsWithAuth);
        _wsDefaults = new WebSocketDefaults
        {
            TenantName = tenantName,
            GetToken = () =>
            {
                var token = tokenProvider.GetAccessTokenAsync().GetAwaiter().GetResult();
                return token.StartsWith("Bearer ", StringComparison.OrdinalIgnoreCase)
                    ? token["Bearer ".Length..]
                    : token;
            },
            Environment = clientOptions?.Environment?.Wss ?? "",
        };
        Auth = new AuthClient(_client);
    }

    public IAuthClient Auth { get; }

    public IStreamApi CreateStreamApi(StreamApi.Options options)
    {
        options = StreamApi.Options.WithDefaults(options, _wsDefaults);
        return new StreamApi(options);
    }

    public ITranscribeApi CreateTranscribeApi(TranscribeApi.Options? options = null)
    {
        options = TranscribeApi.Options.WithDefaults(options, _wsDefaults);
        return new TranscribeApi(options);
    }
}
