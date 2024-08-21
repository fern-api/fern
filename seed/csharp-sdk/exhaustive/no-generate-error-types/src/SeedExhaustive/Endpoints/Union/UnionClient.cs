using SeedExhaustive.Core;
using SeedExhaustive;
using System.Net.Http;
using System.Text.Json;

#nullable enable

namespace SeedExhaustive.Endpoints;

public partial class UnionClient
{
    private RawClient _client;
    internal UnionClient (RawClient client) {
        _client = client;
    }

    public async Task<object> GetAndReturnUnionAsync(object request, RequestOptions? options = null) {
        var response = await _client.MakeRequestAsync(new RawClient.JsonApiRequestnew RawClient.JsonApiRequest{ 
                BaseUrl = _client.Options.BaseUrl, Method = HttpMethod.Post, Path = "/union", Body = request, Options = options
            }, cancellationToken);
        var responseBody = await response.Raw.Content.ReadAsStringAsync();
        if (response.StatusCode is >= 200 and < 400) {
            try
            {
                return JsonUtils.Deserialize<object>(responseBody)!;
            }
            catch (JsonException e)
            {
                throw new SeedExhaustiveException("Failed to deserialize response", e);
            }
        }
        
        throw new SeedExhaustiveApiException($"Error with status code {response.StatusCode}", response.StatusCode, responseBody);
    }

}
