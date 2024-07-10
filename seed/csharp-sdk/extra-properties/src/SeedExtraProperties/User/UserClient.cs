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

    public async Task<User> CreateUserAsync(CreateUserRequest request)
    {
        var response = await _client.MakeRequestAsync(
            new RawClient.JsonApiRequest
            {
                Method = HttpMethod.Post,
                Path = "/user",
                Body = request
            }
        );
        var responseBody = await response.Raw.Content.ReadAsStringAsync();
        if (response.StatusCode is >= 200 and < 400)
        {
            return JsonSerializer.Deserialize<User>(responseBody)!;
        }
        throw new Exception(responseBody);
    }
}
