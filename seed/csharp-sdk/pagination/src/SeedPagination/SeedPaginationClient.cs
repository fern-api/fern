using SeedPagination.Core;

#nullable enable

namespace SeedPagination;

public partial class SeedPaginationClient
{
    private RawClient _client;

    public SeedPaginationClient(string token, ClientOptions? clientOptions = null)
    {
        var defaultHeaders = new Headers(
            new Dictionary<string, string>()
            {
                { "X-Fern-Language", "C#" },
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
        Users = new UsersClient(_client);
    }

    public UsersClient Users { get; init; }
}
