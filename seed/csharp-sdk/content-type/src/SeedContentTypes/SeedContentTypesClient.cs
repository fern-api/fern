using SeedContentTypes.Core;

namespace SeedContentTypes;

public partial class SeedContentTypesClient : ISeedContentTypesClient
{
    private readonly RawClient _client;

    public SeedContentTypesClient(ClientOptions? clientOptions = null)
    {
        var defaultHeaders = new Headers(
            new Dictionary<string, string>()
            {
                { "X-Fern-Language", "C#" },
                { "X-Fern-SDK-Name", "SeedContentTypes" },
                { "X-Fern-SDK-Version", Version.Current },
                { "User-Agent", "Ferncontent-type/0.0.1" },
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
        Service = new ServiceClient(_client);
        Raw = new WithRawResponseClient(_client);
    }

    public ServiceClient Service { get; }

    public SeedContentTypesClient.WithRawResponseClient Raw { get; }

    public partial class WithRawResponseClient
    {
        private readonly RawClient _client;

        internal WithRawResponseClient(RawClient client)
        {
            _client = client;
        }
    }
}
