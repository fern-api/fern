using SeedWebsocketMultiUrl.Core;

namespace SeedWebsocketMultiUrl;

public partial class SeedWebsocketMultiUrlClient : ISeedWebsocketMultiUrlClient
{
    private readonly RawClient _client;

    public SeedWebsocketMultiUrlClient(string? token = null, ClientOptions? clientOptions = null)
    {
        clientOptions ??= new ClientOptions();
        var platformHeaders = new Headers(
            new Dictionary<string, string>()
            {
                { "X-Fern-Language", "C#" },
                { "X-Fern-SDK-Name", "SeedWebsocketMultiUrl" },
                { "X-Fern-SDK-Version", Version.Current },
                { "User-Agent", "Fernwebsocket-multi-url/0.0.1" },
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
            new Dictionary<string, string>() { { "Authorization", $"Bearer {token ?? ""}" } }
        );
        foreach (var header in authHeaders)
        {
            clientOptionsWithAuth.Headers[header.Key] = header.Value;
        }
        _client = new RawClient(clientOptionsWithAuth);
    }

    public IRealtimeApi CreateRealtimeApi(RealtimeApi.Options options)
    {
        return new RealtimeApi(options);
    }
}
