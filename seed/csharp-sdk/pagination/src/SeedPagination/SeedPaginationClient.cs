using SeedPagination.Core;

namespace SeedPagination;

public partial class SeedPaginationClient
{
    private readonly RawClient _client;

    public SeedPaginationClient(string token, ClientOptions? clientOptions = null)
    {
        var defaultHeaders = new Headers(
            new Dictionary<string, string>()
            {
                { "X-Fern-Language", "C#" },
                { "X-Fern-SDK-Name", "SeedPagination" },
                { "X-Fern-SDK-Version", Version.Current },
                { "User-Agent", "Fernpagination/0.0.1" },
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
        Complex = new ComplexClient(_client);
        Users = new UsersClient(_client);
    }

    public ComplexClient Complex { get; init; }

    public UsersClient Users { get; init; }
}
