using SeedPaginationUriPath.Core;

namespace SeedPaginationUriPath;

public partial class SeedPaginationUriPathClient : ISeedPaginationUriPathClient
{
    private readonly RawClient _client;

    public SeedPaginationUriPathClient(string token, ClientOptions? clientOptions = null)
    {
        clientOptions ??= new ClientOptions();
        var platformHeaders = new Headers(
            new Dictionary<string, string>()
            {
                { "X-Fern-Language", "C#" },
                { "X-Fern-SDK-Name", "SeedPaginationUriPath" },
                { "X-Fern-SDK-Version", Version.Current },
                { "User-Agent", "Fernpagination-uri-path/0.0.1" },
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
            new Dictionary<string, string>() { { "Authorization", $"Bearer {token}" } }
        );
        foreach (var header in authHeaders)
        {
            clientOptionsWithAuth.Headers[header.Key] = header.Value;
        }
        _client = new RawClient(clientOptionsWithAuth);
        Users = new UsersClient(_client);
    }

    public IUsersClient Users { get; }
}
