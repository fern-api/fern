using SeedApi.Core;
using SeedApi.Endpoints;
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
        Inlinedrequests = new InlinedrequestsClient(_client);
        Noauth = new NoauthClient(_client);
        Noreqbody = new NoreqbodyClient(_client);
        Reqwithheaders = new ReqwithheadersClient(_client);
        Endpoints = new EndpointsClient(_client);
    }

    public IInlinedrequestsClient Inlinedrequests { get; }

    public INoauthClient Noauth { get; }

    public INoreqbodyClient Noreqbody { get; }

    public IReqwithheadersClient Reqwithheaders { get; }

    public IEndpointsClient Endpoints { get; }
}
