using SeedObject.Core;

namespace SeedObject;

public partial class SeedObjectClient : ISeedObjectClient
{
    private readonly RawClient _client;

    public SeedObjectClient(ClientOptions? clientOptions = null)
    {
        var defaultHeaders = new Headers(
            new Dictionary<string, string>()
            {
                { "X-Fern-Language", "C#" },
                { "X-Fern-SDK-Name", "SeedObject" },
                { "X-Fern-SDK-Version", Version.Current },
                { "User-Agent", "Fernobject/0.0.1" },
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

    public SeedObjectClient.WithRawResponseClient Raw { get; }

    public partial class WithRawResponseClient
    {
        private readonly RawClient _client;

        internal WithRawResponseClient(RawClient client)
        {
            _client = client;
        }
    }
}
