using SeedEnum.Core;

namespace SeedEnum;

public partial class SeedEnumClient
{
    private readonly RawClient _client;

    public SeedEnumClient(ClientOptions? clientOptions = null)
    {
        var defaultHeaders = new Headers(
            new Dictionary<string, string>()
            {
                { "X-Fern-Language", "C#" },
                { "X-Fern-SDK-Name", "SeedEnum" },
                { "X-Fern-SDK-Version", Version.Current },
                { "User-Agent", "Fernenum/0.0.1" },
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
        InlinedRequest = new InlinedRequestClient(_client);
        PathParam = new PathParamClient(_client);
        QueryParam = new QueryParamClient(_client);
        Unknown = new UnknownClient(_client);
    }

    public InlinedRequestClient InlinedRequest { get;
#if NET5_0_OR_GREATER
        init;
#else
        set;
#endif
    }

    public PathParamClient PathParam { get;
#if NET5_0_OR_GREATER
        init;
#else
        set;
#endif
    }

    public QueryParamClient QueryParam { get;
#if NET5_0_OR_GREATER
        init;
#else
        set;
#endif
    }

    public UnknownClient Unknown { get;
#if NET5_0_OR_GREATER
        init;
#else
        set;
#endif
    }
}
