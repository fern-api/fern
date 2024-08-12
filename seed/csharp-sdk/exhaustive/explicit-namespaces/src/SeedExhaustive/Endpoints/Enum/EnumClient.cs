using System.Net.Http;
using System.Text.Json;
using SeedExhaustive;
using SeedExhaustive.Core;
using SeedExhaustive.Types.Enum;

#nullable enable

namespace SeedExhaustive.Endpoints.Enum;

public partial class EnumClient
{
    private RawClient _client;

    internal EnumClient(RawClient client)
    {
        _client = client;
    }

    public async Task<WeatherReport> GetAndReturnEnumAsync(
        WeatherReport request,
        RequestOptions? options = null
    )
    {
        var response = await _client.MakeRequestAsync(
            new RawClient.JsonApiRequest
            {
                BaseUrl = _client.Options.BaseUrl,
                Method = HttpMethod.Post,
                Path = "/enum",
                Body = request,
                Options = options
            }
        );
        var responseBody = await response.Raw.Content.ReadAsStringAsync();
        if (response.StatusCode is >= 200 and < 400)
        {
            try
            {
                return JsonUtils.Deserialize<WeatherReport>(responseBody)!;
            }
            catch (JsonException e)
            {
                throw new SeedExhaustiveException("Failed to deserialize response", e);
            }
        }

        throw new SeedExhaustiveApiException(
            $"Error with status code {response.StatusCode}",
            response.StatusCode,
            responseBody
        );
    }
}
