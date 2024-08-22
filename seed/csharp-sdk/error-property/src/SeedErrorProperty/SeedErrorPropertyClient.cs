using SeedErrorProperty.Core;

#nullable enable

namespace SeedErrorProperty;

public partial class SeedErrorPropertyClient
{
    private RawClient _client;

    public SeedErrorPropertyClient(ClientOptions? clientOptions = null)
    {
        var defaultHeaders = new Headers(
            new Dictionary<string, string>()
            {
                { "X-Fern-Language", "C#" },
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
        Errors = new ErrorsClient(_client);
        PropertyBasedError = new PropertyBasedErrorClient(_client);
    }

    public ErrorsClient Errors { get; init; }

    public PropertyBasedErrorClient PropertyBasedError { get; init; }
}
