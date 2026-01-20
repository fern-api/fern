using SeedObjectsWithImports.Core;

namespace SeedObjectsWithImports;

public partial class SeedObjectsWithImportsClient : ISeedObjectsWithImportsClient
{
    private readonly RawClient _client;

    public SeedObjectsWithImportsClient(ClientOptions? clientOptions = null)
    {
        var defaultHeaders = new Headers(
            new Dictionary<string, string>()
            {
                { "X-Fern-Language", "C#" },
                { "X-Fern-SDK-Name", "SeedObjectsWithImports" },
                { "X-Fern-SDK-Version", Version.Current },
                { "User-Agent", "Fernobjects-with-imports/0.0.1" },
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
        Raw = new WithRawResponseClient(_client);
    }

    public SeedObjectsWithImportsClient.WithRawResponseClient Raw { get; }

    public partial class WithRawResponseClient
    {
        private readonly RawClient _client;

        internal WithRawResponseClient(RawClient client)
        {
            _client = client;
        }
    }
}
