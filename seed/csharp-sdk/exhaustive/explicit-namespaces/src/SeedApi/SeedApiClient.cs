using SeedApi.Core;
using SeedApi.EndpointsContainer;
using SeedApi.EndpointsContentType;
using SeedApi.EndpointsEnum;
using SeedApi.EndpointsHttpMethods;
using SeedApi.EndpointsObject;
using SeedApi.EndpointsPagination;
using SeedApi.EndpointsParams;
using SeedApi.EndpointsPrimitive;
using SeedApi.EndpointsPut;
using SeedApi.EndpointsUnion;
using SeedApi.EndpointsUrLs;
using SeedApi.Inlinedrequests;
using SeedApi.Noauth;
using SeedApi.Noreqbody;
using SeedApi.Reqwithheaders;

namespace SeedApi;

public partial class SeedApiClient : ISeedApiClient
{
    private readonly RawClient _client;

    public SeedApiClient(string token, ClientOptions? clientOptions = null)
    {
        clientOptions ??= new ClientOptions();
        var platformHeaders = new Headers(
            new Dictionary<string, string>()
            {
                { "X-Fern-Language", "C#" },
                { "X-Fern-SDK-Name", "SeedApi" },
                { "X-Fern-SDK-Version", Version.Current },
                { "User-Agent", "Fernexhaustive/0.0.1" },
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
        EndpointsContainer = new EndpointsContainerClient(_client);
        EndpointsContentType = new EndpointsContentTypeClient(_client);
        EndpointsEnum = new EndpointsEnumClient(_client);
        EndpointsHttpMethods = new EndpointsHttpMethodsClient(_client);
        EndpointsObject = new EndpointsObjectClient(_client);
        EndpointsPagination = new EndpointsPaginationClient(_client);
        EndpointsParams = new EndpointsParamsClient(_client);
        EndpointsPrimitive = new EndpointsPrimitiveClient(_client);
        EndpointsPut = new EndpointsPutClient(_client);
        EndpointsUnion = new EndpointsUnionClient(_client);
        EndpointsUrLs = new EndpointsUrLsClient(_client);
        Inlinedrequests = new InlinedrequestsClient(_client);
        Noauth = new NoauthClient(_client);
        Noreqbody = new NoreqbodyClient(_client);
        Reqwithheaders = new ReqwithheadersClient(_client);
    }

    public IEndpointsContainerClient EndpointsContainer { get; }

    public IEndpointsContentTypeClient EndpointsContentType { get; }

    public IEndpointsEnumClient EndpointsEnum { get; }

    public IEndpointsHttpMethodsClient EndpointsHttpMethods { get; }

    public IEndpointsObjectClient EndpointsObject { get; }

    public IEndpointsPaginationClient EndpointsPagination { get; }

    public IEndpointsParamsClient EndpointsParams { get; }

    public IEndpointsPrimitiveClient EndpointsPrimitive { get; }

    public IEndpointsPutClient EndpointsPut { get; }

    public IEndpointsUnionClient EndpointsUnion { get; }

    public IEndpointsUrLsClient EndpointsUrLs { get; }

    public IInlinedrequestsClient Inlinedrequests { get; }

    public INoauthClient Noauth { get; }

    public INoreqbodyClient Noreqbody { get; }

    public IReqwithheadersClient Reqwithheaders { get; }
}
