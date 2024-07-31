using System.Net.Http;
using System.Text.Json;
using SeedCodeSamples;
using SeedCodeSamples.Core;

#nullable enable

namespace SeedCodeSamples;

public class ServiceClient
{
    private RawClient _client;

    public ServiceClient(RawClient client)
    {
        _client = client;
    }

    public async Task<MyResponse> HelloAsync(MyRequest request, RequestOptions? options = null)
    {
        var response = await _client.MakeRequestAsync(
            new RawClient.JsonApiRequest
            {
                BaseUrl = _client.Options.BaseUrl,
                Method = HttpMethod.Post,
                Path = "hello",
                Body = request,
                Options = options
            }
        );
        var responseBody = await response.Raw.Content.ReadAsStringAsync();
        if (response.StatusCode is >= 200 and < 400)
        {
            try
            {
                return JsonUtils.Deserialize<MyResponse>(responseBody)!;
            }
            catch (JsonException e)
            {
                throw new SeedCodeSamplesException("Failed to deserialize response", e);
            }
        }

        throw new SeedCodeSamplesApiException(
            $"Error with status code {response.StatusCode}",
            response.StatusCode,
            JsonUtils.Deserialize<object>(responseBody)
        );
    }
}
