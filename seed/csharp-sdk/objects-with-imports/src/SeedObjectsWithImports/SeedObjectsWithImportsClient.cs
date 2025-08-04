using SeedObjectsWithImports.Core;

namespace SeedObjectsWithImports;

public partial class SeedObjectsWithImportsClient
{
    private readonly RawClient _client;

    public SeedObjectsWithImportsClient(ClientOptions? clientOptions = null)
    {
        var defaultHeaders = new Headers(
            new Dictionary<string, string>()
            {
                { "X-Fern-Language", "C#" },
                { "X-Fern-SDK-Name", "SeedObjectsWithImports" },
                { "X-Fern-SDK-Version", Version.Current },
                { "User-Agent", "Fernobjects-with-imports/0.0.1" },
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
    }
}
