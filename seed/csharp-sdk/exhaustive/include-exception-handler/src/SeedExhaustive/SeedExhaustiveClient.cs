using SeedExhaustive.Core;
using SeedExhaustive.Endpoints;
using SeedExhaustive.Types;

namespace SeedExhaustive;

public partial class SeedExhaustiveClient
{
    private readonly RawClient _client;

    private ExceptionHandler _exceptionHandler;

    public SeedExhaustiveClient(
        string token,
        IExceptionInterceptor? exceptionInterceptor = null,
        ClientOptions? clientOptions = null
    )
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
        _exceptionHandler = new ExceptionHandler(exceptionInterceptor);
        _client = new RawClient(clientOptions);
        Endpoints = new EndpointsClient(_client, _exceptionHandler);
        GeneralErrors = new GeneralErrorsClient(_client, _exceptionHandler);
        InlinedRequests = new InlinedRequestsClient(_client, _exceptionHandler);
        NoAuth = new NoAuthClient(_client, _exceptionHandler);
        NoReqBody = new NoReqBodyClient(_client, _exceptionHandler);
        ReqWithHeaders = new ReqWithHeadersClient(_client, _exceptionHandler);
        Types = new TypesClient(_client, _exceptionHandler);
    }

    public EndpointsClient Endpoints { get; init; }

    public GeneralErrorsClient GeneralErrors { get; init; }

    public InlinedRequestsClient InlinedRequests { get; init; }

    public NoAuthClient NoAuth { get; init; }

    public NoReqBodyClient NoReqBody { get; init; }

    public ReqWithHeadersClient ReqWithHeaders { get; init; }

    public TypesClient Types { get; init; }
}
