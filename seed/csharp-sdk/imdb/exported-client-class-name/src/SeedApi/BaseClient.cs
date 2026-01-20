using SeedApi.Core;

namespace SeedApi;

public partial class BaseClient : IBaseClient
{
    private readonly RawClient _client;

    public BaseClient(string token, ClientOptions? clientOptions = null)
    {
        var defaultHeaders = new Headers(
            new Dictionary<string, string>()
            {
                { "Authorization", $"Bearer {token}" },
                { "X-Fern-Language", "C#" },
                { "X-Fern-SDK-Name", "SeedApi" },
                { "X-Fern-SDK-Version", Version.Current },
                { "User-Agent", "Fernimdb/0.0.1" },
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
        _client = new RawClient(clientOptions);
        Imdb = new ImdbClient(_client);
        Raw = new WithRawResponseClient(_client);
    }

    public ImdbClient Imdb { get; }

    public BaseClient.WithRawResponseClient Raw { get; }

    public partial class WithRawResponseClient
    {
        private readonly RawClient _client;

        internal WithRawResponseClient(RawClient client)
        {
            _client = client;
        }
    }
}
