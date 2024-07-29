using System.Net.Http;
using SeedAudiences.Core;
using SeedAudiences.FolderA;

#nullable enable

namespace SeedAudiences.FolderA;

public class ServiceClient
{
    private RawClient _client;

    public ServiceClient(RawClient client)
    {
        _client = client;
    }

    public async Task<Response> GetDirectThreadAsync()
    {
        var response = await _client.MakeRequestAsync(
            new RawClient.JsonApiRequest
            {
                BaseUrl = _client.Options.BaseUrl,
                Method = HttpMethod.Get,
                Path = ""
            }
        );
        var responseBody = await response.Raw.Content.ReadAsStringAsync();
        if (response.StatusCode is >= 200 and < 400)
        {
            return JsonUtils.Deserialize<Response>(responseBody)!;
        }
        throw new Exception(responseBody);
    }
}
