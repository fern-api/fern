using SeedMultiLineDocs.Core;
using System.Threading.Tasks;
using System.Threading;
using System.Net.Http;
using System.Text.Json;

    namespace SeedMultiLineDocs;

public partial class UserClient
{
    private RawClient _client;
    internal UserClient (RawClient client) {
        _client = client;
    }

    /// <summary>
    /// Retrieve a user.
    /// This endpoint is used to retrieve a user.
    /// </summary>
    /// <example>
    /// <code>
    /// await client.User.GetUserAsync("userId");
    /// </code>
    /// </example>
    public async Task GetUserAsync(string userId, RequestOptions? options = null, CancellationToken cancellationToken = default) {
        var response = await _client.MakeRequestAsync(new RawClient.JsonApiRequest{ 
                BaseUrl = _client.Options.BaseUrl, Method = HttpMethod.Get, Path = $"users/{userId}", Options = options
            }, cancellationToken).ConfigureAwait(false);
        if (response.StatusCode is >= 200 and < 400) {
            return;
        }
        var responseBody = await response.Raw.Content.ReadAsStringAsync();
        throw new SeedMultiLineDocsApiException($"Error with status code {response.StatusCode}", response.StatusCode, responseBody);
    }

    /// <summary>
    /// Create a new user.
    /// This endpoint is used to create a new user.
    /// </summary>
    /// <example>
    /// <code>
    /// await client.User.CreateUserAsync(new CreateUserRequest { Name = "name", Age = 1 });
    /// </code>
    /// </example>
    public async Task<User> CreateUserAsync(CreateUserRequest request, RequestOptions? options = null, CancellationToken cancellationToken = default) {
        var response = await _client.MakeRequestAsync(new RawClient.JsonApiRequest{ 
                BaseUrl = _client.Options.BaseUrl, Method = HttpMethod.Post, Path = "users", Body = request, Options = options
            }, cancellationToken).ConfigureAwait(false);
        var responseBody = await response.Raw.Content.ReadAsStringAsync();
        if (response.StatusCode is >= 200 and < 400) {
            try
            {
                return JsonUtils.Deserialize<User>(responseBody)!;
            }
            catch (JsonException e)
            {
                throw new SeedMultiLineDocsException("Failed to deserialize response", e);
            }
        }
        
        throw new SeedMultiLineDocsApiException($"Error with status code {response.StatusCode}", response.StatusCode, responseBody);
    }

}
