using SeedHeaderToken.Core;

namespace SeedHeaderToken;

public partial class SeedHeaderTokenClient : ISeedHeaderTokenClient
{
    private readonly RawClient _client;

    public SeedHeaderTokenClient(
        string? headerTokenAuth = null,
        ClientOptions? clientOptions = null
    )
    {
        clientOptions ??= new ClientOptions();
        var platformHeaders = new Headers(
            new Dictionary<string, string>()
            {
                { "X-Fern-Language", "C#" },
                { "X-Fern-SDK-Name", "SeedHeaderToken" },
                { "X-Fern-SDK-Version", Version.Current },
                { "User-Agent", "Fernheader-auth/0.0.1" },
            }
        );
        foreach (var header in platformHeaders)
        {
            if (!clientOptions.Headers.ContainsKey(header.Key))
            {
                clientOptions.Headers[header.Key] = header.Value;
            }
        }
        var clientOptionsWithAuth = clientOptions.Clone();
        var authHeaders = new Headers(
            new Dictionary<string, string>()
            {
                { "x-api-key", $"test_prefix {headerTokenAuth ?? ""}" },
            }
        );
        foreach (var header in authHeaders)
        {
            clientOptionsWithAuth.Headers[header.Key] = header.Value;
        }
        _client = new RawClient(clientOptionsWithAuth);
        Service = new ServiceClient(_client);
    }

    public ServiceClient Service { get; }
}
