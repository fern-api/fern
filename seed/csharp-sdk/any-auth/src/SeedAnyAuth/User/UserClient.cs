using SeedAnyAuth.Core;
using System.Threading.Tasks;
using System.Threading;
using System.Net.Http;
using System.Text.Json;

    namespace SeedAnyAuth;

public partial class UserClient
{
    private RawClient _client;
    internal UserClient (RawClient client) {
        _client = client;
    }

    /// <example>
    /// <code>
    /// await client.User.GetAsync();
    /// </code>
    /// </example>
    public async Task<IEnumerable<User>> GetAsync(RequestOptions? options = null, CancellationToken cancellationToken = default) {
        var response = await _client.MakeRequestAsync(new RawClient.JsonApiRequest{ 
                BaseUrl = _client.Options.BaseUrl, Method = HttpMethod.Post, Path = "users", Options = options
            }, cancellationToken).ConfigureAwait(false);
        var responseBody = await response.Raw.Content.ReadAsStringAsync();
        if (response.StatusCode is >= 200 and < 400) {
            try
            {
                return JsonUtils.Deserialize<IEnumerable<User>>(responseBody)!;
            }
            catch (JsonException e)
            {
                throw new SeedAnyAuthException("Failed to deserialize response", e);
            }
        }
        
        throw new SeedAnyAuthApiException($"Error with status code {response.StatusCode}", response.StatusCode, responseBody);
    }

}
