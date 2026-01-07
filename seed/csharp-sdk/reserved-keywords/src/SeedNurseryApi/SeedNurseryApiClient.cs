using SeedNurseryApi.Core;

namespace SeedNurseryApi;

public partial class SeedNurseryApiClient : ISeedNurseryApiClient
{
    private readonly RawClient _client;

    public SeedNurseryApiClient(ClientOptions? clientOptions = null)
    {
        var defaultHeaders = new Headers(
            new Dictionary<string, string>()
            {
                { "X-Fern-Language", "C#" },
                { "X-Fern-SDK-Name", "SeedNurseryApi" },
                { "X-Fern-SDK-Version", Version.Current },
                { "User-Agent", "Fernreserved-keywords/0.0.1" },
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
        Package = new PackageClient(_client);
    }

    public PackageClient Package { get; }
}
