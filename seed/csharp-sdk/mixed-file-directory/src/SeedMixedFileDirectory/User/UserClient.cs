using System.Net.Http;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;
using SeedMixedFileDirectory.Core;
using SeedMixedFileDirectory.User;

namespace SeedMixedFileDirectory;

public partial class UserClient
{
    private RawClient _client;

    internal UserClient(RawClient client)
    {
        _client = client;
        Events = new EventsClient(_client);
    }

    public EventsClient Events { get; }

    /// <summary>
    /// List all users.
    /// </summary>
    /// <example>
    /// <code>
    /// await client.User.ListAsync(new ListUsersRequest { Limit = 1 });
    /// </code>
    /// </example>
    public async Task<IEnumerable<User>> ListAsync(
        ListUsersRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        var _query = new Dictionary<string, object>();
        if (request.Limit != null)
        {
            _query["limit"] = request.Limit.Value.ToString();
        }
        var response = await _client
            .MakeRequestAsync(
                new RawClient.JsonApiRequest
                {
                    BaseUrl = _client.Options.BaseUrl,
                    Method = HttpMethod.Get,
                    Path = "/users/",
                    Query = _query,
                    Options = options,
                },
                cancellationToken
            )
            .ConfigureAwait(false);
        var responseBody = await response.Raw.Content.ReadAsStringAsync();
        if (response.StatusCode is >= 200 and < 400)
        {
            try
            {
                return JsonUtils.Deserialize<IEnumerable<User>>(responseBody)!;
            }
            catch (JsonException e)
            {
                throw new SeedMixedFileDirectoryException("Failed to deserialize response", e);
            }
        }

        throw new SeedMixedFileDirectoryApiException(
            $"Error with status code {response.StatusCode}",
            response.StatusCode,
            responseBody
        );
    }
}
