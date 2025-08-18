using SeedExhaustive.Core;
using SeedExhaustive.Endpoints;
using SeedExhaustive.InlinedRequests;
using SeedExhaustive.NoAuth;
using SeedExhaustive.NoReqBody;
using SeedExhaustive.ReqWithHeaders;

namespace SeedExhaustive;

public partial class SeedExhaustiveClient
{
    private readonly SeedExhaustive.Core.RawClient _client;

    public SeedExhaustiveClient(string token, SeedExhaustive.ClientOptions? clientOptions = null)
    {
        var defaultHeaders = new SeedExhaustive.Core.Headers(
            new Dictionary<string, string>()
            {
                { "Authorization", $"Bearer {token}" },
                { "X-Fern-Language", "C#" },
                { "X-Fern-SDK-Name", "SeedExhaustive" },
                { "X-Fern-SDK-Version", SeedExhaustive.Version.Current },
                { "User-Agent", "Fernexhaustive/0.0.1" },
            }
        );
        clientOptions ??= new SeedExhaustive.ClientOptions();
        foreach (var header in defaultHeaders)
        {
            if (!clientOptions.Headers.ContainsKey(header.Key))
            {
                clientOptions.Headers[header.Key] = header.Value;
            }
        }
        _client = new SeedExhaustive.Core.RawClient(clientOptions);
        Endpoints = new SeedExhaustive.Endpoints.EndpointsClient(_client);
        InlinedRequests = new SeedExhaustive.InlinedRequests.InlinedRequestsClient(_client);
        NoAuth = new SeedExhaustive.NoAuth.NoAuthClient(_client);
        NoReqBody = new SeedExhaustive.NoReqBody.NoReqBodyClient(_client);
        ReqWithHeaders = new SeedExhaustive.ReqWithHeaders.ReqWithHeadersClient(_client);
    }

    public SeedExhaustive.Endpoints.EndpointsClient Endpoints { get; }

    public SeedExhaustive.InlinedRequests.InlinedRequestsClient InlinedRequests { get; }

    public SeedExhaustive.NoAuth.NoAuthClient NoAuth { get; }

    public SeedExhaustive.NoReqBody.NoReqBodyClient NoReqBody { get; }

    public SeedExhaustive.ReqWithHeaders.ReqWithHeadersClient ReqWithHeaders { get; }
}
