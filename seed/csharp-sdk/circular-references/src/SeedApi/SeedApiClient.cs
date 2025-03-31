using SeedApi.Core;

namespace SeedApi;

public partial class SeedApiClient
{
    private readonly RawClient _client;

    public SeedApiClient(ClientOptions? clientOptions = null)
    {
        var defaultHeaders = new Headers(
            new Dictionary<string, string>()
            {
                { "X-Fern-Language", "C#" },
                { "X-Fern-SDK-Name", "SeedApi" },
                { "X-Fern-SDK-Version", Version.Current },
                { "User-Agent", "Ferncircular-references/0.0.1" },
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
        A = new AClient(_client);
        Ast = new AstClient(_client);
    }

    public AClient A { get;
#if NET5_0_OR_GREATER
        init;
#else
        set;
#endif
    }

    public AstClient Ast { get;
#if NET5_0_OR_GREATER
        init;
#else
        set;
#endif
    }
}
