using SeedExhaustive.Core;
using SeedExhaustive.Endpoints;

namespace SeedExhaustive;

public partial class SeedExhaustiveClient : ISeedExhaustiveClient
{
    private readonly RawClient _client;

    public SeedExhaustiveClient(string token, ClientOptions? clientOptions = null)
    {
        try
        {
            clientOptions ??= new ClientOptions();
            clientOptions.ExceptionHandler = new ExceptionHandler(
                new SeedExhaustiveExceptionInterceptor(clientOptions)
            );
            var platformHeaders = new Headers(
                new Dictionary<string, string>()
                {
                    { "X-Fern-Language", "C#" },
                    { "X-Fern-SDK-Name", "SeedExhaustive" },
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
            Endpoints = new EndpointsClient(_client);
            InlinedRequests = new InlinedRequestsClient(_client);
            NoAuth = new NoAuthClient(_client);
            NoReqBody = new NoReqBodyClient(_client);
            ReqWithHeaders = new ReqWithHeadersClient(_client);
        }
        catch (Exception ex)
        {
            var interceptor = new SeedExhaustiveExceptionInterceptor(clientOptions);
            interceptor.Intercept(ex);
            throw;
        }
    }

    public EndpointsClient Endpoints { get; }

    public InlinedRequestsClient InlinedRequests { get; }

    public NoAuthClient NoAuth { get; }

    public NoReqBodyClient NoReqBody { get; }

    public ReqWithHeadersClient ReqWithHeaders { get; }
}
