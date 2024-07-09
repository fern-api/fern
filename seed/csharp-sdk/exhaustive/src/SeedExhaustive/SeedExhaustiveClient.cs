using SeedExhaustive;
using SeedExhaustive.Core;
using SeedExhaustive.Endpoints;
using SeedExhaustive.Types;

#nullable enable

namespace SeedExhaustive;

public partial class SeedExhaustiveClient
{
    private RawClient _client;

    public SeedExhaustiveClient(string token, ClientOptions? clientOptions = null)
    {
        _client = new RawClient(
            new Dictionary<string, string>() { { "X-Fern-Language", "C#" }, },
            clientOptions ?? new ClientOptions()
        );
        Endpoints = new EndpointsClient(_client);
        GeneralErrors = new GeneralErrorsClient(_client);
        InlinedRequests = new InlinedRequestsClient(_client);
        NoAuth = new NoAuthClient(_client);
        NoReqBody = new NoReqBodyClient(_client);
        ReqWithHeaders = new ReqWithHeadersClient(_client);
        Types = new TypesClient(_client);
    }

    public EndpointsClient Endpoints { get; }

    public GeneralErrorsClient GeneralErrors { get; }

    public InlinedRequestsClient InlinedRequests { get; }

    public NoAuthClient NoAuth { get; }

    public NoReqBodyClient NoReqBody { get; }

    public ReqWithHeadersClient ReqWithHeaders { get; }

    public TypesClient Types { get; }
}
