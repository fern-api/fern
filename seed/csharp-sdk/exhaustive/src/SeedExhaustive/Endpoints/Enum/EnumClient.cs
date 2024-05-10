using System.Text.Json;
using SeedExhaustive;
using SeedExhaustive.Types;

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
            new RawClient.ApiRequest
            {
                Method = HttpMethod.Post,
                Path = "",
                Body = request
            }
        );
        string responseBody = await response.Raw.Content.ReadAsStringAsync();
        if (response.StatusCode >= 200 && response.StatusCode < 400)
        {
            return JsonSerializer.Deserialize<WeatherReport>(responseBody);
        }
        throw new Exception();
    }
}
