using SeedCsharpNamespaceConflict.A;
using SeedCsharpNamespaceConflict.B;
using SeedCsharpNamespaceConflict.Core;

namespace SeedCsharpNamespaceConflict;

public partial class SeedCsharpNamespaceConflictClient
{
    private readonly RawClient _client;

    public SeedCsharpNamespaceConflictClient(ClientOptions? clientOptions = null)
    {
        var defaultHeaders = new Headers(
            new Dictionary<string, string>()
            {
                { "X-Fern-Language", "C#" },
                { "X-Fern-SDK-Name", "SeedCsharpNamespaceConflict" },
                { "X-Fern-SDK-Version", Version.Current },
                { "User-Agent", "Ferncsharp-namespace-conflict/0.0.1" },
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
        B = new BClient(_client);
        Tasktest = new TasktestClient(_client);
    }

    public AClient A { get;
#if NET5_0_OR_GREATER
        init;
#else
        set;
#endif
    }

    public BClient B { get;
#if NET5_0_OR_GREATER
        init;
#else
        set;
#endif
    }

    public TasktestClient Tasktest { get;
#if NET5_0_OR_GREATER
        init;
#else
        set;
#endif
    }
}
