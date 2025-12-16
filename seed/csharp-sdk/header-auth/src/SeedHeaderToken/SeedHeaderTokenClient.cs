using SeedHeaderToken.Core;

namespace SeedHeaderToken;

public partial class SeedHeaderTokenClient
{
    private readonly RawClient _client;

    public SeedHeaderTokenClient(
        string? headerTokenAuth = null,
        ClientOptions? clientOptions = null
    )
    {
        var defaultHeaders = new Headers(
            new Dictionary<string, string>()
            {
                { "x-api-key", $"test_prefix {headerTokenAuth ?? ""}" },
                { "X-Fern-Language", "C#" },
                { "X-Fern-SDK-Name", "SeedHeaderToken" },
                { "X-Fern-SDK-Version", Version.Current },
                { "User-Agent", "Fernheader-auth/0.0.1" },
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
