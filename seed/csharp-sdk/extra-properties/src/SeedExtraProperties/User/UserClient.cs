using System.Text.Json;
using SeedExtraProperties;

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
            new RawClient.ApiRequest
            {
                Method = HttpMethod.Post,
                Path = "/user",
                Body = request
            }
        );
        string responseBody = await response.Raw.Content.ReadAsStringAsync();
        if (response.StatusCode >= 200 && response.StatusCode < 400)
        {
            return JsonSerializer.Deserialize<User>(responseBody);
        }
        throw new Exception();
    }
}
