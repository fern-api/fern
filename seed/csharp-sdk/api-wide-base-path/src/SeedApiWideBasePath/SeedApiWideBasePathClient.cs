using SeedApiWideBasePath.Core;

namespace SeedApiWideBasePath;

public partial class SeedApiWideBasePathClient : ISeedApiWideBasePathClient
{
    private readonly RawClient _client;

    public SeedApiWideBasePathClient(ClientOptions? clientOptions = null)
    {
        var defaultHeaders = new Headers(
            new Dictionary<string, string>()
            {
                { "X-Fern-Language", "C#" },
                { "X-Fern-SDK-Name", "SeedApiWideBasePath" },
                { "X-Fern-SDK-Version", Version.Current },
                { "User-Agent", "Fernapi-wide-base-path/0.0.1" },
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

    public SeedApiWideBasePathClient.WithRawResponseClient Raw { get; }

    public partial class WithRawResponseClient
    {
        private readonly RawClient _client;

        internal WithRawResponseClient(RawClient client)
        {
            _client = client;
        }
    }
}
