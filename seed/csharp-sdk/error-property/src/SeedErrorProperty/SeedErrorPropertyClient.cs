using SeedErrorProperty.Core;

namespace SeedErrorProperty;

public partial class SeedErrorPropertyClient
{
    private readonly RawClient _client;

    public SeedErrorPropertyClient(ClientOptions? clientOptions = null)
    {
        var defaultHeaders = new Headers(
            new Dictionary<string, string>()
            {
                { "X-Fern-Language", "C#" },
                { "X-Fern-SDK-Name", "SeedErrorProperty" },
                { "X-Fern-SDK-Version", Version.Current },
                { "User-Agent", "Fernerror-property/0.0.1" },
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
        PropertyBasedError = new PropertyBasedErrorClient(_client);
    }

    public PropertyBasedErrorClient PropertyBasedError { get; }
}
