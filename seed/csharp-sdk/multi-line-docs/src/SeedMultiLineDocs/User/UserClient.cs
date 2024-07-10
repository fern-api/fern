using System.Net.Http;
using System.Text.Json;
using SeedMultiLineDocs;
using SeedMultiLineDocs.Core;

#nullable enable

namespace SeedMultiLineDocs;

public class UserClient
{
    private RawClient _client;

    public UserClient(RawClient client)
    {
        _client = client;
    }

    /// <summary>
    /// Retrieve a user.
    /// This endpoint is used to retrieve a user.
    /// </summary>
    public async Task GetUserAsync(string userId)
    {
        await _client.MakeRequestAsync(
            new RawClient.JsonApiRequest { Method = HttpMethod.Get, Path = $"users/{userId}" }
        );
    }

    /// <summary>
    /// Create a new user.
    /// This endpoint is used to create a new user.
    /// </summary>
    public async Task<User> CreateUserAsync(CreateUserRequest request)
    {
        var response = await _client.MakeRequestAsync(
            new RawClient.JsonApiRequest
            {
                Method = HttpMethod.Post,
                Path = "users",
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
