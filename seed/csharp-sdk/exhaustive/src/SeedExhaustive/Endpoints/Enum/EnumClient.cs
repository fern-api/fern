using System.Net.Http;
using SeedExhaustive.Core;
using SeedExhaustive.Types;

#nullable enable

namespace SeedExhaustive.Endpoints;

public class EnumClient
{
    private RawClient _client;

    public EnumClient(RawClient client)
    {
        _client = client;
    }

    public async Task<WeatherReport> GetAndReturnEnumAsync(WeatherReport request)
    {
        var response = await _client.MakeRequestAsync(
            new RawClient.JsonApiRequest
            {
                BaseUrl = _client.Options.BaseUrl,
                Method = HttpMethod.Post,
                Path = "/enum",
                Body = request
            }
        );
        var responseBody = await response.Raw.Content.ReadAsStringAsync();
        if (response.StatusCode is >= 200 and < 400)
        {
            return JsonUtils.Deserialize<WeatherReport>(responseBody)!;
        }
        throw new Exception(responseBody);
    }
}
