using SeedStreaming.Core;

namespace SeedStreaming;

public partial class SeedStreamingClient : ISeedStreamingClient
{
    private readonly RawClient _client;

    public SeedStreamingClient(ClientOptions? clientOptions = null)
    {
        clientOptions ??= new ClientOptions();
        var platformHeaders = new Headers(
            new Dictionary<string, string>()
            {
                { "X-Fern-Language", "C#" },
                { "X-Fern-SDK-Name", "SeedStreaming" },
                { "X-Fern-SDK-Version", Version.Current },
                { "User-Agent", "Fernstreaming-parameter/0.0.1" },
            }
        );
        foreach (var header in platformHeaders)
        {
            if (!clientOptions.Headers.ContainsKey(header.Key))
            {
                clientOptions.Headers[header.Key] = header.Value;
            }
        }
        _client = new RawClient(clientOptions);
        Dummy = new DummyClient(_client);
    }

    public DummyClient Dummy { get; }
}
