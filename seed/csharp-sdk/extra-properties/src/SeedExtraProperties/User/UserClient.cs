using System.Net.Http;
using System.Text.Json;
using SeedExtraProperties;
using SeedExtraProperties.Core;

#nullable enable

namespace SeedExtraProperties;

public class UserClient
{
    private RawClient _client;

    public UserClient(RawClient client)
    {
        _client = client;
    }

    public async Task<User> CreateUserAsync(
        CreateUserRequest request,
        RequestOptions? options = null
    )
    {
        var response = await _client.MakeRequestAsync(
            new RawClient.JsonApiRequest
            {
                BaseUrl = _client.Options.BaseUrl,
                Method = HttpMethod.Post,
                Path = "/user",
                Body = request,
                Options = options
            }
        );
        var responseBody = await response.Raw.Content.ReadAsStringAsync();
        if (response.StatusCode is >= 200 and < 400)
        {
            try
            {
                return JsonUtils.Deserialize<User>(responseBody)!;
            }
            catch (JsonException e)
            {
                throw new SeedExtraPropertiesException("Failed to deserialize response", e);
            }
        }

        throw new SeedExtraPropertiesApiException(
            $"Error with status code {response.StatusCode}",
            response.StatusCode,
            JsonUtils.Deserialize<object>(responseBody)
        );
    }
}
