using SeedExhaustive.Core;
using System.Threading.Tasks;
using SeedExhaustive;
using System.Net.Http;

#nullable enable

namespace SeedExhaustive.ReqWithHeaders;

public partial class ReqWithHeadersClient
{
    private RawClient _client;
    internal ReqWithHeadersClient (RawClient client) {
        _client = client;
    }

    public async Task GetWithCustomHeaderAsync(ReqWithHeaders request, RequestOptions? options = null) {
        var _headers = new Dictionary<string, string>() {
            { "X-TEST-ENDPOINT-HEADER", request.XTestEndpointHeader }, 
        };
        var response = await _client.MakeRequestAsync(new RawClient.JsonApiRequestnew RawClient.JsonApiRequest{ 
                BaseUrl = _client.Options.BaseUrl, Method = HttpMethod.Post, Path = "/test-headers/custom-header", Body = request.Body, Headers = _headers, Options = options
            }, cancellationToken);
        if (response.StatusCode is >= 200 and < 400) {
            return;
        }
        var responseBody = await response.Raw.Content.ReadAsStringAsync();
        throw new SeedExhaustiveApiException($"Error with status code {response.StatusCode}", response.StatusCode, responseBody);
    }

}
