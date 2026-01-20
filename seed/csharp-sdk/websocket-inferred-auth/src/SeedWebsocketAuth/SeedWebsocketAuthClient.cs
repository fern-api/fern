using SeedWebsocketAuth.Core;

namespace SeedWebsocketAuth;

public partial class SeedWebsocketAuthClient : ISeedWebsocketAuthClient
{
    private readonly RawClient _client;

    public SeedWebsocketAuthClient(
        string xApiKey,
        string clientId,
        string clientSecret,
        string? scope = null,
        ClientOptions? clientOptions = null
    )
    {
        var defaultHeaders = new Headers(
            new Dictionary<string, string>()
            {
                { "X-Fern-Language", "C#" },
                { "X-Fern-SDK-Name", "SeedWebsocketAuth" },
                { "X-Fern-SDK-Version", Version.Current },
                { "User-Agent", "Fernwebsocket-inferred-auth/0.0.1" },
            }
        );
        clientOptions ??= new ClientOptions();
        foreach (var header in defaultHeaders)
        {
            if (!clientOptions.Headers.ContainsKey(header.Key))
            {
                clientOptions.Headers[header.Key] = header.Value;
            }
        }
        var inferredAuthProvider = new InferredAuthTokenProvider(
            xApiKey,
            clientId,
            clientSecret,
            scope,
            new AuthClient(new RawClient(clientOptions.Clone()))
        );
        clientOptions.Headers["Authorization"] =
            new Func<global::System.Threading.Tasks.ValueTask<string>>(async () =>
                (await inferredAuthProvider.GetAuthHeadersAsync().ConfigureAwait(false))
                    .First()
                    .Value
            );
        _client = new RawClient(clientOptions);
        Auth = new AuthClient(_client);
        Raw = new WithRawResponseClient(_client);
    }

    public AuthClient Auth { get; }

    public SeedWebsocketAuthClient.WithRawResponseClient Raw { get; }

    public partial class WithRawResponseClient
    {
        private readonly RawClient _client;

        internal WithRawResponseClient(RawClient client)
        {
            _client = client;
        }
    }
}
