using SeedExhaustive.Core;
using SeedExhaustive.Types;
using System.Net.Http;
using System.Text.Json;

#nullable enable

namespace SeedExhaustive;

public partial class NoReqBodyClient
{
    private RawClient _client;
    internal NoReqBodyClient (RawClient client) {
        _client = client;
    }

    public async Task<ObjectWithOptionalField> GetWithNoRequestBodyAsync(RequestOptions? options = null) {
        var response = await _client.MakeRequestAsync(new RawClient.JsonApiRequestnew RawClient.JsonApiRequest{ 
                BaseUrl = _client.Options.BaseUrl, Method = HttpMethod.Get, Path = "/no-req-body", Options = options
            }, cancellationToken);
        var responseBody = await response.Raw.Content.ReadAsStringAsync();
        if (response.StatusCode is >= 200 and < 400) {
            try
            {
                return JsonUtils.Deserialize<ObjectWithOptionalField>(responseBody)!;
            }
            catch (JsonException e)
            {
                throw new SeedExhaustiveException("Failed to deserialize response", e);
            }
        }
        
        throw new SeedExhaustiveApiException($"Error with status code {response.StatusCode}", response.StatusCode, responseBody);
    }

    public async Task<string> PostWithNoRequestBodyAsync(RequestOptions? options = null) {
        var response = await _client.MakeRequestAsync(new RawClient.JsonApiRequestnew RawClient.JsonApiRequest{ 
                BaseUrl = _client.Options.BaseUrl, Method = HttpMethod.Post, Path = "/no-req-body", Options = options
            }, cancellationToken);
        var responseBody = await response.Raw.Content.ReadAsStringAsync();
        if (response.StatusCode is >= 200 and < 400) {
            try
            {
                return JsonUtils.Deserialize<string>(responseBody)!;
            }
            catch (JsonException e)
            {
                throw new SeedExhaustiveException("Failed to deserialize response", e);
            }
        }
        
        throw new SeedExhaustiveApiException($"Error with status code {response.StatusCode}", response.StatusCode, responseBody);
    }

}
