using SeedStreaming.Core;

namespace SeedStreaming;

public partial class SeedStreamingClient : ISeedStreamingClient
{
    private readonly RawClient _client;

    public SeedStreamingClient(ClientOptions? clientOptions = null)
    {
        var defaultHeaders = new Headers(
            new Dictionary<string, string>()
            {
                { "X-Fern-Language", "C#" },
                { "X-Fern-SDK-Name", "SeedStreaming" },
                { "X-Fern-SDK-Version", Version.Current },
                { "User-Agent", "Fernstreaming/0.0.1" },
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
        Dummy = new DummyClient(_client);
        Raw = new RawAccessClient(_client);
    }

    public DummyClient Dummy { get; }

    public SeedStreamingClient.RawAccessClient Raw { get; }

    public partial class RawAccessClient
    {
        private readonly RawClient _client;

        internal RawAccessClient(RawClient client)
        {
            _client = client;
        }
    }
}
