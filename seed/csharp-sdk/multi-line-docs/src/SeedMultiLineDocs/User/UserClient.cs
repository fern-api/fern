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
    public async Task GetUserAsync(string userId, RequestOptions? options = null)
    {
        var response = await _client.MakeRequestAsync(
            new RawClient.JsonApiRequest
            {
                BaseUrl = _client.Options.BaseUrl,
                Method = HttpMethod.Get,
                Path = $"users/{userId}",
                Options = options
            }
        );
        if (response.StatusCode is >= 200 and < 400)
        {
            return;
        }
        var responseBody = await response.Raw.Content.ReadAsStringAsync();
        throw new SeedMultiLineDocsApiException(
            $"Error with status code {response.StatusCode}",
            response.StatusCode,
            JsonUtils.Deserialize<object>(responseBody)
        );
    }

    /// <summary>
    /// Create a new user.
    /// This endpoint is used to create a new user.
    /// </summary>
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
                Path = "users",
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
                throw new SeedMultiLineDocsException("Failed to deserialize response", e);
            }
        }

        throw new SeedMultiLineDocsApiException(
            $"Error with status code {response.StatusCode}",
            response.StatusCode,
            JsonUtils.Deserialize<object>(responseBody)
        );
    }
}
