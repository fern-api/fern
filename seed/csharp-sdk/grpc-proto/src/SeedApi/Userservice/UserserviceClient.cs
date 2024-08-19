using System.Net.Http;
using System.Text.Json;
using SeedApi.Core;

#nullable enable

namespace SeedApi;

public partial class UserserviceClient
{
    private RawClient _client;

    internal UserserviceClient(RawClient client)
    {
        _client = client;
    }

    public async Task<CreateResponse> CreateAsync(
        CreateRequest request,
        RequestOptions? options = null
    )
    {
        var response = await _client.MakeRequestAsync(
            new RawClient.JsonApiRequest
            {
                BaseUrl = _client.Options.BaseUrl,
                Method = HttpMethod.Post,
                Path = "users",
                Body = request,
                Options = options,
            }
        );
        var responseBody = await response.Raw.Content.ReadAsStringAsync();
        if (response.StatusCode is >= 200 and < 400)
        {
            try
            {
                return JsonUtils.Deserialize<CreateResponse>(responseBody)!;
            }
            catch (JsonException e)
            {
                throw new SeedApiException("Failed to deserialize response", e);
            }
        }

        throw new SeedApiApiException(
            $"Error with status code {response.StatusCode}",
            response.StatusCode,
            responseBody
        );
    }
}
