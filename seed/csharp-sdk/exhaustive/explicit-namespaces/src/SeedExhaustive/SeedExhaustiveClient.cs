using System;
using SeedExhaustive.Core;
using SeedExhaustive.Endpoints;
using SeedExhaustive.GeneralErrors;
using SeedExhaustive.InlinedRequests;
using SeedExhaustive.NoAuth;
using SeedExhaustive.NoReqBody;
using SeedExhaustive.ReqWithHeaders;
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
            new Dictionary<string, Func<string>>() { },
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

    public EndpointsClient Endpoints { get; init; }

    public GeneralErrorsClient GeneralErrors { get; init; }

    public InlinedRequestsClient InlinedRequests { get; init; }

    public NoAuthClient NoAuth { get; init; }

    public NoReqBodyClient NoReqBody { get; init; }

    public ReqWithHeadersClient ReqWithHeaders { get; init; }

    public TypesClient Types { get; init; }
}
