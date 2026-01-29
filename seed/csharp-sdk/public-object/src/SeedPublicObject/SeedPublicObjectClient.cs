using SeedPublicObject.Core;

namespace SeedPublicObject;

public partial class SeedPublicObjectClient : ISeedPublicObjectClient
{
    private readonly RawClient _client;

    public SeedPublicObjectClient(ClientOptions? clientOptions = null)
    {
        clientOptions ??= new ClientOptions();
        var platformHeaders = new Headers(
            new Dictionary<string, string>()
            {
                { "X-Fern-Language", "C#" },
                { "X-Fern-SDK-Name", "SeedPublicObject" },
                { "X-Fern-SDK-Version", Version.Current },
                { "User-Agent", "Fernpublic-object/0.0.1" },
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
        Service = new ServiceClient(_client);
    }

    public ServiceClient Service { get; }
}
