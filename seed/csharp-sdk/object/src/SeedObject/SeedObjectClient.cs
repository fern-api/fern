using SeedObject.Core;

namespace SeedObject;

public partial class SeedObjectClient : ISeedObjectClient
{
    private readonly RawClient _client;

    public SeedObjectClient(ClientOptions? clientOptions = null)
    {
        clientOptions ??= new ClientOptions();
        var platformHeaders = new Headers(
            new Dictionary<string, string>()
            {
                { "X-Fern-Language", "C#" },
                { "X-Fern-SDK-Name", "SeedObject" },
                { "X-Fern-SDK-Version", Version.Current },
                { "User-Agent", "Fernobject/0.0.1" },
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
    }
}
