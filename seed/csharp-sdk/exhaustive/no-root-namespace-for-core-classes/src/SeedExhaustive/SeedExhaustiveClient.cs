using SeedExhaustive.Core;
using SeedExhaustive.Endpoints;
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

    public EndpointsClient Endpoints { get; init; }

    public GeneralErrorsClient GeneralErrors { get; init; }

    public InlinedRequestsClient InlinedRequests { get; init; }

    public NoAuthClient NoAuth { get; init; }

    public NoReqBodyClient NoReqBody { get; init; }

    public ReqWithHeadersClient ReqWithHeaders { get; init; }

    public TypesClient Types { get; init; }
}
