using System.Net.Http;
using System.Text.Json;
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
                Method = HttpMethod.Post,
                Path = "/enum",
                Body = request
            }
        );
        var responseBody = await response.Raw.Content.ReadAsStringAsync();
        if (response.StatusCode is >= 200 and < 400)
        {
            return JsonSerializer.Deserialize<WeatherReport>(responseBody)!;
        }
        throw new Exception(responseBody);
    }
}
