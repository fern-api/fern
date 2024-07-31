using System.Net.Http;
using SeedApiWideBasePath.Core;

#nullable enable

namespace SeedApiWideBasePath;

public class ServiceClient
{
    private RawClient _client;

    public ServiceClient(RawClient client)
    {
        _client = client;
    }

    public async Task PostAsync(
        string pathParam,
        string serviceParam,
        string resourceParam,
        int endpointParam
    )
    {
        var response = await _client.MakeRequestAsync(
            new RawClient.JsonApiRequest
            {
                BaseUrl = _client.Options.BaseUrl,
                Method = HttpMethod.Post,
                Path = $"/test/{pathParam}/{serviceParam}/{endpointParam}/{resourceParam}"
            }
        );
        if (response.StatusCode is >= 200 and < 400)
        {
            return;
        }
        var responseBody = await response.Raw.Content.ReadAsStringAsync();
        throw new SeedApiWideBasePathApiException(
            $"Error with status code {response.StatusCode}",
            response.StatusCode,
            JsonUtils.Deserialize<object>(responseBody)
        );
    }
}
