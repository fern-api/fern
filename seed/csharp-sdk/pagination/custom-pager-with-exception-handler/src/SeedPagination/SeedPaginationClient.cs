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
                { "Authorization", $"Bearer {token}" },
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

    public ComplexClient Complex { get;
#if NET5_0_OR_GREATER
        init;
#else
        set;
#endif
    }

    public UsersClient Users { get;
#if NET5_0_OR_GREATER
        init;
#else
        set;
#endif
    }
}
