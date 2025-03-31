using SeedExhaustive.Core;
using SeedExhaustive.Endpoints;
using SeedExhaustive.GeneralErrors;
using SeedExhaustive.InlinedRequests;
using SeedExhaustive.NoAuth;
using SeedExhaustive.NoReqBody;
using SeedExhaustive.ReqWithHeaders;
using SeedExhaustive.Types;

namespace SeedExhaustive;

public partial class SeedExhaustiveClient
{
    private readonly RawClient _client;

    public SeedExhaustiveClient(string token, ClientOptions? clientOptions = null)
    {
        var defaultHeaders = new Headers(
            new Dictionary<string, string>()
            {
                { "Authorization", $"Bearer {token}" },
                { "X-Fern-Language", "C#" },
                { "X-Fern-SDK-Name", "SeedExhaustive" },
                { "X-Fern-SDK-Version", Version.Current },
                { "User-Agent", "Fernexhaustive/0.0.1" },
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
        Endpoints = new EndpointsClient(_client);
        GeneralErrors = new GeneralErrorsClient(_client);
        InlinedRequests = new InlinedRequestsClient(_client);
        NoAuth = new NoAuthClient(_client);
        NoReqBody = new NoReqBodyClient(_client);
        ReqWithHeaders = new ReqWithHeadersClient(_client);
        Types = new TypesClient(_client);
    }

    public EndpointsClient Endpoints { get;
#if NET5_0_OR_GREATER
        init;
#else
        set;
#endif
    }

    public GeneralErrorsClient GeneralErrors { get;
#if NET5_0_OR_GREATER
        init;
#else
        set;
#endif
    }

    public InlinedRequestsClient InlinedRequests { get;
#if NET5_0_OR_GREATER
        init;
#else
        set;
#endif
    }

    public NoAuthClient NoAuth { get;
#if NET5_0_OR_GREATER
        init;
#else
        set;
#endif
    }

    public NoReqBodyClient NoReqBody { get;
#if NET5_0_OR_GREATER
        init;
#else
        set;
#endif
    }

    public ReqWithHeadersClient ReqWithHeaders { get;
#if NET5_0_OR_GREATER
        init;
#else
        set;
#endif
    }

    public TypesClient Types { get;
#if NET5_0_OR_GREATER
        init;
#else
        set;
#endif
    }
}
