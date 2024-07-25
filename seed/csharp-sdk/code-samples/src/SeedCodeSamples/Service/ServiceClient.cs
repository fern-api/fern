using System.Net.Http;
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

    public async Task<MyResponse> HelloAsync(MyRequest request)
    {
        var response = await _client.MakeRequestAsync(
            new RawClient.JsonApiRequest
            {
                Method = HttpMethod.Post,
                Path = "hello",
                Body = request
            }
        );
        var responseBody = await response.Raw.Content.ReadAsStringAsync();
        if (response.StatusCode is >= 200 and < 400)
        {
            return JsonUtils.Deserialize<MyResponse>(responseBody)!;
        }
        throw new Exception(responseBody);
    }
}
