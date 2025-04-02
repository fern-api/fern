using SeedPublicObject.Core;

namespace SeedPublicObject;

public partial class SeedPublicObjectClient
{
    private readonly RawClient _client;

    public SeedPublicObjectClient(ClientOptions? clientOptions = null)
    {
        var defaultHeaders = new Headers(
            new Dictionary<string, string>()
            {
                { "X-Fern-Language", "C#" },
                { "X-Fern-SDK-Name", "SeedPublicObject" },
                { "X-Fern-SDK-Version", Version.Current },
                { "User-Agent", "Fernpublic-object/0.0.1" },
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
    }

    public ServiceClient Service { get; }
}
